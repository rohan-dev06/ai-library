const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { extractTextFromImage, analyzeIntent } = require('../utils/ai_search');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 30 * 1024 * 1024 } // 30MB limit
});

const { verifyToken } = require('../middleware/auth');

const Book = require('../models/Book');
const Payment = require('../models/Payment');
const BookIssue = require('../models/BookIssue');
const ReadingLog = require('../models/ReadingLog');
const Notification = require('../models/Notification');
const Author = require('../models/Author'); // Needed for some lookups
const BookContent = require('../models/BookContent'); // For full-text search

// Get Book Content (Text Mode)
router.get('/book/:id/content', async (req, res) => {
    try {
        const bookId = Number(req.params.id);
        const page = Number(req.query.page) || 1;

        const content = await BookContent.findOne({ bookId, sequenceNumber: page });
        const totalPages = await BookContent.countDocuments({ bookId });

        if (!content) {
            return res.status(404).json({ message: 'Content not found', totalPages });
        }

        res.json({
            text: content.text,
            title: content.title,
            page: content.sequenceNumber,
            totalPages
        });
    } catch (error) {
        console.error('Get Content Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Books
router.get('/books', async (req, res) => {
    try {
        const books = await Book.find().populate('author').sort({ id: 1 });

        // Flatten author object to strings for frontend compatibility
        const formattedBooks = books.map(book => {
            const b = book.toObject();
            return {
                ...b,
                author: b.author ? b.author.name : 'Unknown',
                publisher: b.author ? b.author.publisher : '',
                authorBio: b.author ? b.author.bio : ''
            };
        });

        res.json(formattedBooks);
    } catch (error) {
        console.error('Get Books Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Issue Book
router.post('/issue', verifyToken, async (req, res) => {
    try {
        const { bookId, bookTitle } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if book already issued and active (idempotency)
        const existingIssue = await BookIssue.findOne({
            userId,
            bookId,
            status: { $in: ['issued', 'overdue'] }
        });

        if (existingIssue) {
            return res.status(400).json({ message: 'You have already issued this book.' });
        }

        // Check sufficient coins
        if (user.coins < 100) {
            return res.status(400).json({ message: 'Insufficient coins! Please buy more.' });
        }

        // Check availability
        const book = await Book.findOne({ id: bookId });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.bookType !== 'EBOOK' && !book.available) {
            return res.status(400).json({ message: 'Book is currently unavailable' });
        }

        // Lock physical book
        if (book.bookType !== 'EBOOK') {
            book.available = false;
            await book.save();
        }

        const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days

        // Create BookIssue Record
        const newIssue = new BookIssue({
            userId,
            bookId,
            issueDate: new Date(),
            dueDate: dueDate,
            lastFineCheck: dueDate, // Fines start after due date
            status: 'issued'
        });
        await newIssue.save();

        // Deduct coins
        user.coins -= 100;
        await user.save();

        // Payment Record
        const transaction = new Payment({
            userId: user._id,
            username: user.username,
            amount: -100,
            type: 'ISSUE',
            description: `Issued: ${bookTitle}`,
            status: 'success'
        });
        await transaction.save();

        // Fetch updated active issues and populate details for frontend state
        const issues = await BookIssue.find({
            userId,
            status: { $in: ['issued', 'overdue'] }
        });

        const now = new Date();
        const issuedBooksWithStatus = await Promise.all(issues.map(async (issue) => {
            const dueDate = new Date(issue.dueDate);
            const diffTime = now - dueDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const bookDetails = await Book.findOne({ id: issue.bookId });

            return {
                bookId: issue.bookId,
                title: bookDetails ? bookDetails.title : 'Unknown Title',
                image: bookDetails ? bookDetails.image : '',
                issueDate: issue.issueDate,
                dueDate: issue.dueDate,
                status: diffDays > 0 ? 'Overdue' : 'Active',
                daysLeft: diffDays > 0 ? 0 : Math.abs(diffDays),
                fine: issue.fine,
                totalFinePaid: issue.fine
            };
        }));

        res.json({
            message: `Issued "${bookTitle}" successfully!`,
            coins: user.coins,
            issuedBooks: issuedBooksWithStatus
        });

    } catch (error) {
        console.error('Issue Book Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Sync Fines
router.post('/sync-fines', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const now = new Date();
        let totalDeducted = 0;
        let finesAccrued = false;

        // 1. Fetch Active Issues
        const activeIssues = await BookIssue.find({
            userId,
            status: { $in: ['issued', 'overdue'] }
        });

        // 2. Batch Fetch Books for Notification Titles
        const issueBookIds = [...new Set(activeIssues.map(i => Number(i.bookId)))];
        const booksMap = new Map();
        if (issueBookIds.length > 0) {
            const books = await Book.find({ id: { $in: issueBookIds } }).select('id title available bookType image');
            books.forEach(b => booksMap.set(b.id, b));
        }

        const notifications = [];

        // 3. Process Fines in Memory
        for (const issue of activeIssues) {
            const dueDate = new Date(issue.dueDate);
            let lastCheck = issue.lastFineCheck ? new Date(issue.lastFineCheck) : dueDate;
            if (lastCheck < dueDate) lastCheck = dueDate;

            if (now > lastCheck) {
                const diffTime = now - lastCheck;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 0) {
                    const fine = diffDays * 20;
                    totalDeducted += fine;

                    issue.fine = (issue.fine || 0) + fine;
                    issue.lastFineCheck = now;
                    issue.status = 'overdue';
                    // We'll save all at once or individually? iterate and save is okay for small count,
                    // but for strict optimization, bulkWrite is better. For now, Promise.all is good middle ground.

                    finesAccrued = true;

                    const book = booksMap.get(Number(issue.bookId));
                    notifications.push({
                        userId,
                        message: `Fine of ${fine} coins deducted for overdue book "${book ? book.title : 'Unknown'}"`,
                        type: 'warning'
                    });
                }
            }
        }

        // 4. Save Updates (Concurrent)
        if (finesAccrued) {
            await Promise.all([
                ...activeIssues.map(issue => issue.save()),
                Notification.insertMany(notifications)
            ]);
        }

        if (totalDeducted > 0) {
            user.coins -= totalDeducted;
        }

        // Zero Balance Protocol
        let message = "Synced.";
        if (user.coins <= 0) {
            user.coins = 0;
            message = "Balance hit 0! All books returned.";

            // Use bulk write for updates if possible, or parallel save
            for (const issue of activeIssues) {
                issue.status = 'returned';
                issue.returnDate = now;
            }

            // Release physical books
            // Identify physical books that need releasing
            const booksToRelease = [];
            for (const issue of activeIssues) {
                const book = booksMap.get(Number(issue.bookId));
                if (book && book.bookType !== 'EBOOK') {
                    booksToRelease.push(book.id);
                }
            }

            await Promise.all([
                ...activeIssues.map(i => i.save()), // Save returned status
                Book.updateMany({ id: { $in: booksToRelease } }, { available: true })
            ]);
        }

        if (finesAccrued || totalDeducted > 0) {
            await user.save();
            if (totalDeducted > 0) {
                const transaction = new Payment({
                    userId: user._id,
                    username: user.username,
                    amount: -totalDeducted,
                    type: 'FINE',
                    description: 'Overdue Fines',
                    status: 'success'
                });
                await transaction.save();
            }
        }

        // Re-construct response with Map
        const issuedBooksWithStatus = activeIssues.map(issue => {
            const dueDate = new Date(issue.dueDate);
            const diffTime = now - dueDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const bookDetails = booksMap.get(Number(issue.bookId));
            if (!bookDetails) return null;

            return {
                bookId: issue.bookId,
                title: bookDetails.title,
                image: bookDetails.image, // Note: image wasn't selected in batch fetch above, need to add it if commonly used.
                // Ah, image wasn't selected in step 2. Let's fix that in step 2 or rely on it being undefined if not crucial here?
                // Frontend 'issuedBooks' usually needs image.
                issueDate: issue.issueDate,
                dueDate: issue.dueDate,
                status: diffDays > 0 ? 'Overdue' : 'Active',
                daysLeft: diffDays > 0 ? 0 : Math.abs(diffDays),
                fine: issue.fine,
                totalFinePaid: issue.fine
            };
        }).filter(b => b !== null);

        // Fix: Ensure 'image' is fetched in Step 2.
        // But since we can't easily jump back in this string, I will assume the user will ask if image is missing, 
        // OR better: I will include 'image' in the select in Step 2 of THIS replacement.
        // Wait, I can edit the string I'm sending right now.
        // CORRECTED Step 2 Select: .select('id title available bookType image')

        res.json({
            coins: user.coins,
            issuedBooks: issuedBooksWithStatus,
            message,
            autoReturned: user.coins === 0 && totalDeducted > 0
        });

    } catch (error) {
        console.error('Sync Fines Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Return Book
router.post('/return', verifyToken, async (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user.userId;

        const issue = await BookIssue.findOne({
            userId,
            bookId,
            status: { $in: ['issued', 'overdue'] }
        });

        if (!issue) {
            return res.status(400).json({ message: 'Active issue record not found.' });
        }

        issue.status = 'returned';
        issue.returnDate = new Date();
        await issue.save();

        const book = await Book.findOne({ id: bookId });
        if (book && book.bookType !== 'EBOOK') {
            book.available = true;
            await book.save();
        }

        const user = await User.findById(userId);

        // Fetch updated active issues and populate details for frontend state
        const issues = await BookIssue.find({
            userId,
            status: { $in: ['issued', 'overdue'] }
        });

        const now = new Date();
        const issuedBooksWithStatus = await Promise.all(issues.map(async (issue) => {
            const dueDate = new Date(issue.dueDate);
            const diffTime = now - dueDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const bookDetails = await Book.findOne({ id: issue.bookId });

            return {
                bookId: issue.bookId,
                title: bookDetails ? bookDetails.title : 'Unknown Title',
                image: bookDetails ? bookDetails.image : '',
                issueDate: issue.issueDate,
                dueDate: issue.dueDate,
                status: diffDays > 0 ? 'Overdue' : 'Active',
                daysLeft: diffDays > 0 ? 0 : Math.abs(diffDays),
                fine: issue.fine,
                totalFinePaid: issue.fine
            };
        }));

        res.json({
            message: 'Book returned successfully!',
            coins: user ? user.coins : 0,
            issuedBooks: issuedBooksWithStatus
        });

    } catch (error) {
        console.error('Return Book Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add Coins
router.post('/add-coins', verifyToken, async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.userId;

        if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.coins += amount;
        await user.save();

        const payment = new Payment({
            userId: user._id,
            username: user.username,
            amount: amount,
            status: 'success'
        });
        await payment.save();

        res.json({ message: `Successfully added ${amount} coins!`, coins: user.coins });

    } catch (error) {
        console.error('Add Coins Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Dashboard Data
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const now = new Date();

        // 1. Fetch Active Issues
        const issues = await BookIssue.find({
            userId,
            status: { $in: ['issued', 'overdue'] }
        });

        // 2. Batch Fetch Book Details
        const bookIds = [...new Set(issues.filter(i => i.bookId).map(i => Number(i.bookId)))];
        const booksMap = new Map();

        if (bookIds.length > 0) {
            const books = await Book.find({ id: { $in: bookIds } });
            books.forEach(book => booksMap.set(book.id, book));
        }

        // 3. Enrich Issues in Memory
        const validIssuedBooks = issues.map(issue => {
            const bookDetails = booksMap.get(Number(issue.bookId));
            if (!bookDetails) return null;

            const dueDate = new Date(issue.dueDate);
            const diffTime = now - dueDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                bookId: issue.bookId,
                title: bookDetails.title,
                image: bookDetails.image,
                issueDate: issue.issueDate,
                dueDate: issue.dueDate,
                status: diffDays > 0 ? 'Overdue' : 'Active',
                daysLeft: diffDays > 0 ? 0 : Math.abs(diffDays),
                fine: issue.fine || 0,
                totalFinePaid: issue.fine || 0
            };
        }).filter(b => b !== null);


        // 4. Fetch Reading Log & Recommendations
        // Optimization: Use projection to fetch only needed fields
        const readingHistory = await ReadingLog.find({ userId })
            .select('bookId timeSpent')
            .sort({ timeSpent: -1 })
            .limit(10); // Limit history for performance

        // SMART RECOMMENDATIONS SYSTEM
        let recommendations = [];
        const Recommendation = require('../models/Recommendation');

        // Check Cache
        const cachedRecs = await Recommendation.findOne({ userId });
        const cacheDuration = 24 * 60 * 60 * 1000; // 24 Hours

        if (cachedRecs && (now - cachedRecs.updatedAt) < cacheDuration && cachedRecs.recommendations && cachedRecs.recommendations.length >= 3) {
            recommendations = cachedRecs.recommendations;
        } else {
            // Calculate Fresh Recommendations
            let excludeIds = [
                ...issues.map(i => i.bookId),
                ...readingHistory.map(r => r.bookId)
            ];

            // Strategy 1: Based on Top Read Book
            if (readingHistory.length > 0) {
                const topBookId = readingHistory[0].bookId;
                const topBook = await Book.findOne({ id: topBookId }).select('tags title');

                if (topBook && topBook.tags && topBook.tags.length > 0) {
                    const similarBooks = await Book.find({
                        tags: { $in: topBook.tags },
                        id: { $nin: excludeIds }
                    })
                        .select('id title image')
                        .limit(3);

                    recommendations = similarBooks.map(b => ({
                        bookId: b.id,
                        title: b.title,
                        image: b.image,
                        reason: `Because you read "${topBook.title}"`,
                        score: 10
                    }));
                }
            }

            // Strategy 2: Based on Issued Books (if no history or not enough recs)
            if (recommendations.length === 0 && issues.length > 0) {
                const lastIssued = issues[issues.length - 1];
                // Check if book details already in map
                let topBook = booksMap.get(Number(lastIssued.bookId));
                if (!topBook) {
                    topBook = await Book.findOne({ id: lastIssued.bookId }).select('tags title');
                }

                if (topBook && topBook.tags && topBook.tags.length > 0) {
                    const similarBooks = await Book.find({
                        tags: { $in: topBook.tags },
                        id: { $nin: excludeIds }
                    })
                        .select('id title image')
                        .limit(3);

                    recommendations = similarBooks.map(b => ({
                        bookId: b.id,
                        title: b.title,
                        image: b.image,
                        reason: `Because you issued "${topBook.title}"`,
                        score: 8
                    }));
                }
            }

            // Strategy 3: Trending / Random Fallback
            if (recommendations.length < 3) {
                const extraBooks = await Book.find({
                    id: { $nin: [...excludeIds, ...recommendations.map(r => r.bookId)] }
                })
                    .sort({ rating: -1 })
                    .select('id title image rating')
                    .limit(3 - recommendations.length);

                const extraRecs = extraBooks.map(b => ({
                    bookId: b.id,
                    title: b.title,
                    image: b.image,
                    reason: 'Trending on Library',
                    score: 5
                }));

                recommendations = [...recommendations, ...extraRecs];
            }

            // Update Cache
            if (cachedRecs) {
                cachedRecs.recommendations = recommendations;
                cachedRecs.updatedAt = now;
                await cachedRecs.save(); // Async save, don't await if speed is critical? Better await to ensure consistency.
            } else {
                await Recommendation.create({
                    userId,
                    recommendations,
                    updatedAt: now
                });
            }
        }

        // Enforce absolute maximum of 3 items
        if (recommendations.length > 3) {
            recommendations = recommendations.slice(0, 3);
        }

        // Format for frontend
        const finalRecs = recommendations.map(r => ({
            id: r.bookId || r.id,
            title: r.title,
            image: r.image,
            reason: r.reason
        }));

        // Calculate Total Fines
        const allIssues = await BookIssue.find({ userId }).select('fine');
        const totalFines = allIssues.reduce((sum, i) => sum + (i.fine || 0), 0);

        res.json({
            coins: user.coins,
            issuedBooks: validIssuedBooks,
            totalFines,
            recommendations: finalRecs
        });

    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Smart Search (Unchanged mostly, just imports)
router.post('/search/smart', upload.single('image'), async (req, res) => {
    try {
        let searchQuery = req.body.query || '';

        // Image Processing
        if (req.file) {
            try {
                const extractedText = await extractTextFromImage(req.file.buffer);
                searchQuery = extractedText;
            } catch (error) {
                return res.status(500).json({ message: 'Failed to process image' });
            }
        }

        const analysis = analyzeIntent(searchQuery);
        const regexKeywords = analysis.keywords.map(k => new RegExp(k, 'i'));

        let dbQuery = {
            $or: [
                { title: { $in: regexKeywords } },
                { title: { $regex: searchQuery, $options: 'i' } },
                // Author logic: Need to populate or find Author IDs first if searching by author name
                // To keep it simple: We search Book fields. If Book.author is now ObjectId, we can't regex search it directly.
                // We need to Find Authors matching name -> Get IDs -> Search Books with those IDs.
            ]
        };

        // Advanced Author Search
        const matchingAuthors = await Author.find({
            name: { $regex: searchQuery, $options: 'i' }
        });
        const authorIds = matchingAuthors.map(a => a._id);
        if (authorIds.length > 0) {
            dbQuery.$or.push({ author: { $in: authorIds } });
        }

        let stats = await Book.find(dbQuery).populate('author');

        // NEW: Search inside Book Content
        if (searchQuery.length > 3) {
            try {
                // Use Mongo Text Search
                const contentMatches = await BookContent.find(
                    { $text: { $search: searchQuery } },
                    { score: { $meta: "textScore" } }
                )
                    .sort({ score: { $meta: "textScore" } })
                    .limit(20);

                if (contentMatches.length > 0) {
                    const contentBookIds = [...new Set(contentMatches.map(c => c.bookId))];

                    // Fetch these books if not already in stats
                    const existingBookIds = stats.map(b => b.id);
                    const newBookIds = contentBookIds.filter(id => !existingBookIds.includes(id));

                    if (newBookIds.length > 0) {
                        const contentBooks = await Book.find({ id: { $in: newBookIds } }).populate('author');
                        stats = [...stats, ...contentBooks];
                    }

                    // Attach content snippets? (Optional enhancement)
                }
            } catch (err) {
                console.error("Content Search Error (Index might be missing):", err.message);
            }
        }

        // Format results to match /books endpoint (flatten author object)
        const formattedResults = stats.map(book => {
            const b = book.toObject ? book.toObject() : book;
            return {
                ...b,
                author: b.author && b.author.name ? b.author.name : 'Unknown',
                // Keep original ID if needed, or other fields
            };
        });

        res.json({
            results: formattedResults,
            analysis: {
                query: searchQuery,
                keywords: analysis.keywords,
                category: analysis.category
            }
        });

    } catch (error) {
        console.error("Smart Search Error:", error);
        res.status(500).json({ message: 'Search failed' });
    }
});


// Reading Progress
router.post('/progress', verifyToken, async (req, res) => {
    try {
        const { bookId, page, totalPages, duration } = req.body;
        const userId = req.user.userId;

        let log = await ReadingLog.findOne({ userId, bookId: Number(bookId) });

        if (log) {
            log.currentPage = page;
            log.lastRead = Date.now();
            if (totalPages) log.totalPages = totalPages;
            if (duration) log.timeSpent += Number(duration);
            await log.save();
        } else {
            log = new ReadingLog({
                userId,
                bookId,
                currentPage: page,
                totalPages: totalPages || 0,
                timeSpent: duration ? Number(duration) : 0
            });
            await log.save();
        }

        res.json({ message: 'Progress saved' });

    } catch (error) {
        console.error("Save Progress Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/progress/:bookId', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const bookId = Number(req.params.bookId);

        const log = await ReadingLog.findOne({ userId, bookId });

        if (log) {
            // Map to frontend expectation if needed (ReadingLog model uses currentPage, frontend might expect lastPage)
            res.json({
                lastPage: log.currentPage,
                totalPages: log.totalPages,
                timeSpent: log.timeSpent
            });
        } else {
            res.json({ lastPage: 1 });
        }

    } catch (error) {
        console.error("Get Progress Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

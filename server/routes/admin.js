const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User');
const Payment = require('../models/Payment');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const { verifyAdmin } = require('../middleware/auth');

// Get All Users
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }, '-password'); // Exclude password and admins
        res.json(users);
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Block/Unblock User
router.put('/users/:id/block', verifyAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: user.isBlocked });
    } catch (error) {
        console.error('Block User Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Payments
router.get('/payments', verifyAdmin, async (req, res) => {
    try {
        const payments = await Payment.find().sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        console.error('Get Payments Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add New Book
// Fetch Metadata from Google Books
// Fetch Metadata from Google Books (with Open Library Fallback)
router.post('/fetch-metadata', verifyAdmin, async (req, res) => {
    try {
        const { isbn } = req.body;
        if (!isbn) return res.status(400).json({ message: 'ISBN is required' });

        let metadata = null;
        let googleSuccess = false;

        // 1. Try Google Books API
        try {
            const googleResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`, { timeout: 5000 });
            if (googleResponse.data.items && googleResponse.data.items.length > 0) {
                const bookInfo = googleResponse.data.items[0].volumeInfo;
                console.log("Google Books Metadata found:", JSON.stringify(bookInfo, null, 2)); // DEBUG LOG
                metadata = {
                    title: bookInfo.title || '',
                    author: bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown',
                    publisher: bookInfo.publisher || '',
                    description: bookInfo.description ? bookInfo.description.substring(0, 500) + (bookInfo.description.length > 500 ? '...' : '') : '',
                    image: bookInfo.imageLinks?.thumbnail || bookInfo.imageLinks?.smallThumbnail || '',
                    pages: bookInfo.pageCount || 0,
                    rating: bookInfo.averageRating || 0,
                    language: bookInfo.language === 'en' ? 'English' : bookInfo.language,
                    tags: bookInfo.categories ? bookInfo.categories.join(', ') : ''
                };
                googleSuccess = true;
            }
        } catch (googleError) {
            console.warn('Google Books API failed or timed out, trying Open Library...');
        }

        // 2. Fallback to Open Library if Google failed
        if (!googleSuccess) {
            try {
                const openLibResponse = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`, { timeout: 5000 });
                const bookData = openLibResponse.data[`ISBN:${isbn}`];

                if (bookData) {
                    metadata = {
                        title: bookData.title || '',
                        author: bookData.authors ? bookData.authors.map(a => a.name).join(', ') : 'Unknown',
                        publisher: bookData.publishers ? bookData.publishers.map(p => p.name).join(', ') : '',
                        description: '', // Open Library descriptions are often hard to reach or separate
                        image: bookData.cover?.medium || bookData.cover?.small || '',
                        pages: bookData.number_of_pages || 0,
                        rating: 0,
                        language: 'English', // Defaulting as OL doesn't always provide clean lang codes
                        tags: bookData.subjects ? bookData.subjects.slice(0, 5).map(s => s.name).join(', ') : ''
                    };
                }
            } catch (olError) {
                console.error('Open Library API also failed:', olError.message);
            }
        }

        if (!metadata) {
            return res.status(404).json({ message: 'Book not found for this ISBN (checked Google Books & Open Library)' });
        }

        res.json({ message: 'Metadata fetched', metadata });

    } catch (error) {
        console.error('Metadata Fetch Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch metadata' });
    }
});

// Add New Book (with File Upload Support)
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const Author = require('../models/Author'); // Import Author Model

// Configure Cloudinary Direct
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dj28fpuig',
    api_key: process.env.CLOUDINARY_API_KEY || '246163913539519',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'g_gfZXC-WM1TN9Wq2V7QHjklQE4'
});

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for Free Tier Cloudinary raw files
});


// Debug Route
router.get('/debug-upload-test', verifyAdmin, (req, res) => {
    res.json({ message: 'Cloudinary Config Check', config: cloudinary.config() });
});

router.post('/add-book', verifyAdmin, upload.single('bookPdf'), async (req, res) => {
    try {
        const { id, title, author, publisher, authorBio, isbn, description, image, rating, pages, language, tags, bookType, available } = req.body;

        // Get file URL from Cloudinary if uploaded
        let fileUrl = req.body.fileUrl; // Fallback to body if provided

        if (req.file) {
            // Upload buffer to Cloudinary using Stream (Better for large files)
            const { Readable } = require('stream');

            const streamUpload = (buffer) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: 'raw', // Important for PDFs
                            folder: 'library_ebooks',
                            public_id: `ebook_${Date.now()}`
                        },
                        (error, result) => {
                            if (error) {
                                return reject(error);
                            }
                            if (result) {
                                resolve(result);
                            } else {
                                reject(new Error('Unknown Cloudinary upload error'));
                            }
                        }
                    );
                    Readable.from(buffer).pipe(uploadStream);
                });
            };

            try {
                const result = await streamUpload(req.file.buffer);
                fileUrl = result.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary Upload Error:', uploadError);
                return res.status(500).json({ message: 'Cloudinary Upload Failed: ' + (uploadError.message || uploadError) });
            }
        }

        // Validation
        if (!title || !author) {
            return res.status(400).json({ message: 'Title and Author are required.' });
        }

        if (pages && pages <= 0) {
            return res.status(400).json({ message: 'Page count must be greater than 0.' });
        }

        // Auto-generate ID if not provided
        let bookId = id;
        if (!bookId) {
            const lastBook = await Book.findOne().sort({ id: -1 });
            bookId = lastBook ? lastBook.id + 1 : 1;
        }

        const existingBook = await Book.findOne({ $or: [{ id: bookId }, { isbn: isbn || 'unique_placeholder' }] });
        if (existingBook) {
            if (existingBook.id === Number(bookId)) return res.status(400).json({ message: `Book with ID ${bookId} already exists.` });
            if (isbn && existingBook.isbn === isbn) return res.status(400).json({ message: 'Book with this ISBN already exists.' });
        }

        // HANDLE AUTHOR (Ref Logic)
        let authorDoc = await Author.findOne({ name: author });
        if (!authorDoc) {
            // Create new author if doesn't exist
            authorDoc = new Author({
                name: author,
                publisher: publisher || '',
                bio: authorBio || ''
            });
            await authorDoc.save();
        } else {
            // Update existing author if new info provided
            if (publisher && !authorDoc.publisher) {
                authorDoc.publisher = publisher;
                await authorDoc.save();
            }
        }

        const newBook = new Book({
            id: bookId,
            isbn: isbn || undefined,
            title,
            author: authorDoc._id, // Link to Author ObjectId
            // publisher: moved to Author
            // authorBio: moved to Author
            description,
            image,
            rating: rating || 0,
            pages: pages || 0,
            language: language || 'English',
            tags: tags || [],
            available: available !== undefined ? available : true,
            fileUrl: fileUrl || '',
            bookType: bookType || 'EBOOK'
        });

        await newBook.save();

        res.status(201).json({
            message: 'Book added successfully!',
            book: newBook
        });

    } catch (error) {
        console.error('Add Book Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Book
router.delete('/book/:id', verifyAdmin, async (req, res) => {
    try {
        const book = await Book.findOneAndDelete({ id: req.params.id });
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Delete Book Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Book (Basic Info Update)
// Update Book (Basic Info Update)
router.put('/book/:id', verifyAdmin, async (req, res) => {
    try {
        const updates = req.body;
        const book = await Book.findOneAndUpdate({ id: req.params.id }, updates, { new: true });
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json({ message: 'Book updated successfully', book });
    } catch (error) {
        console.error('Update Book Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==========================
// Review Management Routes
// ==========================

// Get All Reviews
const Review = require('../models/Review');
const BookIssue = require('../models/BookIssue');

router.get('/reviews', verifyAdmin, async (req, res) => {
    try {
        const reviews = await Review.find().sort({ date: -1 });
        res.json(reviews);
    } catch (error) {
        console.error('Get Reviews Error:', error);
        res.status(500).json({ message: 'Server error parsing reviews' });
    }
});

// Delete Review
router.delete('/reviews/:id', verifyAdmin, async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete Review Error:', error);
        res.status(500).json({ message: 'Server error deleting review' });
    }
});

// ========================
// Admin Report Route
// ========================
router.get('/report', verifyAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date('2000-01-01');
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999); // include full end day

        // 1. User List
        const users = await User.find({ role: { $ne: 'admin' } }, '-password').sort({ createdAt: 1 });

        // 2. Book List
        const books = await Book.find().populate('author').sort({ id: 1 });
        const formattedBooks = books.map(b => ({
            id: b.id,
            title: b.title,
            author: b.author ? b.author.name : 'Unknown',
            publisher: b.author ? b.author.publisher : '',
            bookType: b.bookType,
            available: b.available,
            language: b.language,
            pages: b.pages
        }));

        // 3. User-wise Issue List (filtered by issueDate in range)
        const issues = await BookIssue.find({
            issueDate: { $gte: start, $lte: end }
        }).populate('userId', 'username email').sort({ issueDate: -1 });

        // Batch fetch book titles for issues
        const issueBookIds = [...new Set(issues.map(i => i.bookId))];
        const issueBooksMap = new Map();
        if (issueBookIds.length > 0) {
            const issueBooks = await Book.find({ id: { $in: issueBookIds } }).select('id title');
            issueBooks.forEach(b => issueBooksMap.set(b.id, b.title));
        }

        // Group issues by user
        const issuesByUser = {};
        issues.forEach(issue => {
            const userName = issue.userId ? issue.userId.username : 'Unknown';
            const userEmail = issue.userId ? issue.userId.email : '';
            const key = userName;
            if (!issuesByUser[key]) {
                issuesByUser[key] = { username: userName, email: userEmail, issues: [] };
            }
            issuesByUser[key].issues.push({
                bookTitle: issueBooksMap.get(issue.bookId) || `Book #${issue.bookId}`,
                issueDate: issue.issueDate,
                dueDate: issue.dueDate,
                returnDate: issue.returnDate || null,
                status: issue.status,
                fine: issue.fine || 0
            });
        });

        // 4. User-wise Penalty List
        const allIssues = await BookIssue.find({ fine: { $gt: 0 } }).populate('userId', 'username email');
        const penaltyByUser = {};
        allIssues.forEach(issue => {
            const userName = issue.userId ? issue.userId.username : 'Unknown';
            const userEmail = issue.userId ? issue.userId.email : '';
            if (!penaltyByUser[userName]) {
                penaltyByUser[userName] = { username: userName, email: userEmail, totalFine: 0, paidFine: 0 };
            }
            penaltyByUser[userName].totalFine += issue.fine || 0;
            if (issue.isFinePaid) penaltyByUser[userName].paidFine += issue.fine || 0;
        });

        // 5. Monthly/Yearly Income (PURCHASE payments with positive amount, in range)
        const incomePayments = await Payment.find({
            date: { $gte: start, $lte: end },
            type: 'PURCHASE',
            amount: { $gt: 0 },
            status: 'success'
        });

        const incomeByMonth = {};
        incomePayments.forEach(p => {
            const d = new Date(p.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!incomeByMonth[key]) incomeByMonth[key] = { month: key, total: 0, count: 0 };
            incomeByMonth[key].total += p.amount;
            incomeByMonth[key].count += 1;
        });

        const monthlyIncome = Object.values(incomeByMonth).sort((a, b) => a.month.localeCompare(b.month));
        const totalIncome = monthlyIncome.reduce((sum, m) => sum + m.total, 0);

        res.json({
            reportPeriod: { startDate: start, endDate: end },
            users,
            books: formattedBooks,
            issuesByUser: Object.values(issuesByUser),
            penaltyByUser: Object.values(penaltyByUser),
            monthlyIncome,
            totalIncome
        });

    } catch (error) {
        console.error('Report Error:', error);
        res.status(500).json({ message: 'Failed to generate report' });
    }
});

module.exports = router;

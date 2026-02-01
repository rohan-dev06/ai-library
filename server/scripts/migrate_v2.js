
const mongoose = require('mongoose');
const Author = require('../models/Author');
const BookContent = require('../models/BookContent');
const Book = require('../models/Book');

// Hardcoded URI as used in previous scripts for reliability
const mongoURI = 'mongodb+srv://rohandev:rohan4080@cluster0.crh5lm2.mongodb.net/ai-library?retryWrites=true&w=majority';

const migrate = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const books = await Book.find({});
        console.log(`Found ${books.length} books to process.`);

        for (const book of books) {
            console.log(`Processing "${book.title}"...`);
            let updated = false;

            // 1. Migrate Author
            // Check if 'author' field is a string (name) instead of ObjectId
            // Mongoose might cast it to ObjectId if we access it directly via model if schema says ObjectId.
            // But we need to see the raw value or check checks.
            // Since schema supports ref='Author', populate won't work if it's a string name in DB.
            // Let's use lean() or access distinct field if needed, but here we loaded via Model.
            // 'book.author' will be value. If it fails casting, it might be cast error or random.
            // Wait, schema defined "author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true }"
            // If current data is String "J.K. Rowling", fetching it might fail or return CastError.
            // To safely get raw data, we should maybe use logic.
            // Actually, if the current data is incompatible with schema, Mongoose might throw error on find().
            // Let's rely on the fact that standard find might work if we address the collection directly or allow mixed?
            // BETTER APPROACH: Use native driver logic or flexible schema for migration?
            // Or assume the schema was just changed and data is dirty.
            // Let's try to read it. If it fails, I'll use pure collection driver.

            // The inspect script showed: "author": "J.K. Rowling"
            // The model says: type: ObjectId.
            // This find() MIGHT fail.
            // Let's use connection.db to get raw JSON to be safe.
        }

        // RE-IMPLEMENTING LOOP WITH NATIVE CURSOR TO AVOID SCHEMA CATCH-22
        const rawBooks = await mongoose.connection.db.collection('books').find({}).toArray();

        for (const rawBook of rawBooks) {
            console.log(`Migrating book: ${rawBook.title} (ID: ${rawBook.id})`);
            let needsSave = false;
            let authorId = rawBook.author;

            // --- AUTHOR MIGRATION ---
            if (typeof rawBook.author === 'string') {
                // It's a name, verify if author exists
                console.log(`  - Found string author: "${rawBook.author}"`);
                let authorDoc = await Author.findOne({ name: rawBook.author });

                if (!authorDoc) {
                    console.log(`  - Creating new Author: ${rawBook.author}`);
                    authorDoc = new Author({
                        name: rawBook.author,
                        publisher: rawBook.publisher || '', // Move publisher
                        bio: rawBook.authorBio || '',       // Move bio
                        image: '' // Default
                    });
                    await authorDoc.save();
                } else {
                    console.log(`  - Author exists: ${authorDoc._id}`);
                }
                authorId = authorDoc._id;
                needsSave = true;
            }

            // --- CONTENT MIGRATION ---
            if (rawBook.content && Array.isArray(rawBook.content) && rawBook.content.length > 0) {
                console.log(`  - Found ${rawBook.content.length} content items.`);
                // Check if content already exists to avoid duplicates? 
                // Simple check: delete old, recreate new or just check count.
                // Let's assume we move them.

                for (let i = 0; i < rawBook.content.length; i++) {
                    const item = rawBook.content[i];
                    const exists = await BookContent.findOne({ bookId: rawBook.id, sequenceNumber: i + 1 });
                    if (!exists) {
                        await BookContent.create({
                            bookId: rawBook.id,
                            title: item.title || `Chapter ${i + 1}`,
                            text: item.text || item.content || '', // Handle varied structure
                            sequenceNumber: i + 1
                        });
                    }
                }
                console.log(`  - Content migrated.`);
                // We will unset content field in update
                needsSave = true;
            }

            // --- UPDATE BOOK ---
            if (needsSave) {
                const updateOps = {
                    $set: { author: authorId },
                    $unset: { publisher: "", authorBio: "", content: "" }
                };

                await mongoose.connection.db.collection('books').updateOne(
                    { _id: rawBook._id },
                    updateOps
                );
                console.log(`  - Book updated.`);
            } else {
                console.log(`  - No changes needed.`);
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Migration Error:', error);
        process.exit(1);
    }
};

migrate();

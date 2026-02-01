const mongoose = require('mongoose');
const Book = require('../models/Book');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkUrl = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Search for the book seen in screenshot
        // Title: "Problem Solving with Algorithms and Data Structures..."
        const book = await Book.findOne({ title: { $regex: 'Problem Solving', $options: 'i' } });

        if (!book) {
            console.log('Book not found matching title.');

            // List all books with fileUrls just in case
            const allBooks = await Book.find({ fileUrl: { $ne: '' } }).select('title fileUrl');
            console.log('Books with fileUrls:', allBooks);
        } else {
            console.log(`Found Book: "${book.title}"`);
            console.log(`Book Type: ${book.bookType}`);
            console.log(`File URL: "${book.fileUrl}"`);
        }

        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUrl();

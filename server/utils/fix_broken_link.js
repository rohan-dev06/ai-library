const mongoose = require('mongoose');
const Book = require('../models/Book');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fixLink = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const book = await Book.findOne({ title: { $regex: 'Problem Solving', $options: 'i' } });
        if (book) {
            console.log(`Updating book: "${book.title}"`);
            // Point to our newly served local file
            book.fileUrl = 'http://localhost:5000/uploads/pythonds.pdf';
            await book.save();
            console.log('Link updated to localhost:5000/uploads/pythonds.pdf');
        } else {
            console.log('Book not found.');
        }

        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixLink();

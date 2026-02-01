const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const debugIssue = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Get a user
        const user = await User.findOne();
        if (!user) throw new Error('No user found');
        console.log('User found:', user.email);

        // 2. Get Book 999
        const bookId = 999;
        const book = await Book.findOne({ id: bookId });
        if (!book) throw new Error('Book 999 not found');
        console.log('Book found:', book.title, 'Type:', book.bookType);

        // 3. Simulate Logic
        // For Physical books, check availability
        if (book.bookType !== 'EBOOK' && !book.available) {
            throw new Error('Book unavailable logic triggered improperly?');
        }

        // Lock the book ONLY if physical
        if (book.bookType !== 'EBOOK') {
            console.log('Locking physical book...');
            book.available = false;
            await book.save();
        } else {
            console.log('E-Book detected, skipping lock.');
        }

        const dueDate = new Date(Date.now() + 60 * 1000);

        const newIssue = {
            bookId: bookId,
            title: book.title,
            issueDate: new Date(),
            dueDate: dueDate,
            lastFineCheck: dueDate,
            totalFinePaid: 0
        };

        console.log('Pushing to user issuedBooks:', newIssue);
        user.issuedBooks.push(newIssue);

        // This is where it likely fails if validation fails
        await user.save();
        console.log('User saved successfully!');

        process.exit(0);

    } catch (error) {
        console.error('DEBUG ERROR:', error);
        process.exit(1);
    }
};

debugIssue();

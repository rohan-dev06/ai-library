const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const BookIssue = require('../models/BookIssue');
require('dotenv').config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // Find all issues
        const issues = await BookIssue.find({});
        console.log(`Found ${issues.length} total issues.`);

        for (const issue of issues) {
            console.log(`\nIssue ID: ${issue._id}`);
            console.log(`User ID: ${issue.userId}`);
            console.log(`Book ID (in Issue): ${issue.bookId} (Type: ${typeof issue.bookId})`);

            // Try to find the book
            const book = await Book.findOne({ id: issue.bookId });
            if (book) {
                console.log(`✅ Book Found!`);
                console.log(`   Title: '${book.title}'`);
                console.log(`   Image: '${book.image}'`);
                console.log(`   ID: ${book.id}`);
            } else {
                console.log(`❌ Book NOT Found in Book Collection with id: ${issue.bookId}`);
                // Try finding by _id just in case
                const bookById = await Book.findById(issue.bookId).catch(() => null);
                if (bookById) {
                    console.log(`   ⚠️ BUT Found via _id! This means BookIssue is storing _id but schema expects custom id.`);
                }
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

debug();

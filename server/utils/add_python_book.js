const mongoose = require('mongoose');
const Book = require('../models/Book');
require('dotenv').config();

const addPythonBook = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Check if book already exists to avoid duplicates
        const existing = await Book.findOne({ title: "Python Crash Course" });
        if (existing) {
            console.log("Book already exists. Skipping.");
            process.exit(0);
        }

        const pythonBook = new Book({
            id: Date.now(), // Generate a unique ID
            title: "Python Crash Course",
            author: "Eric Matthes",
            rating: 4.8,
            pages: 544,
            language: "English",
            match: "98%",
            image: "https://m.media-amazon.com/images/I/7131+175R5L.jpg", // Real cover image
            available: true,
            description: "A Hands-On, Project-Based Introduction to Programming. Python Crash Course is the world's best-selling guide to the Python programming language.",
            tags: ["Technology", "Python", "Programming", "Coding", "Beginner"],
            content: [
                { title: "Chapter 1", text: "Getting Started with Python..." },
                { title: "Chapter 2", text: "Variables and Simple Data Types..." }
            ]
        });

        await pythonBook.save();
        console.log('Python Book Added Successfully!');
        process.exit();

    } catch (error) {
        console.error('Error adding book:', error);
        process.exit(1);
    }
};

addPythonBook();

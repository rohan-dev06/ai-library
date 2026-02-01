const mongoose = require('mongoose');
const Book = require('../models/Book');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const updateToEbook = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const res = await Book.updateMany({}, {
            $set: {
                bookType: 'EBOOK',
                fileType: 'PDF',
                fileUrl: 'https://pdfobject.com/pdf/sample.pdf' // Reliable sample
            }
        });

        console.log(`Updated ${res.modifiedCount} books to EBOOK type.`);
        process.exit(0);

    } catch (error) {
        console.error('Update Error:', error);
        process.exit(1);
    }
};

updateToEbook();

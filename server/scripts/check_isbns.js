const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BookSchema = new mongoose.Schema({
    title: String,
    image: String,
    isbn: String
});
const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);

if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected. Checking ISBNs...');
        const books = await Book.find({}, 'title isbn image');

        books.forEach(b => {
            console.log(`Title: ${b.title}\n  ISBN: ${b.isbn || 'N/A'}\n  Image: ${b.image}\n`);
        });

        await mongoose.connection.close();
    })
    .catch(err => {
        console.error('Connection Error:', err);
        process.exit(1);
    });

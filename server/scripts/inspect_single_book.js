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
        console.log('Connected. Finding book...');
        const book = await Book.findOne({ title: { $regex: 'Science and Hypothesis', $options: 'i' } });

        if (book) {
            console.log(`Title: ${book.title}`);
            console.log(`ISBN: ${book.isbn}`);
            console.log(`Image: ${book.image}`);
        } else {
            console.log('Book not found.');
        }

        await mongoose.connection.close();
    })
    .catch(err => {
        console.error('Connection Error:', err);
        process.exit(1);
    });

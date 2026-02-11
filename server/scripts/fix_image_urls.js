console.log('Starting URL fix script...');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BookSchema = new mongoose.Schema({
    title: String,
    image: String
});
const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);

if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const books = await Book.find({ image: { $regex: '^http://' } });
        console.log(`Found ${books.length} books with HTTP images.`);

        for (const book of books) {
            book.image = book.image.replace('http://', 'https://');
            await book.save();
            console.log(`Updated: ${book.title}`);
        }

        console.log('All updates complete.');
        await mongoose.connection.close();
    })
    .catch(err => {
        console.error('Connection Error:', err);
        process.exit(1);
    });

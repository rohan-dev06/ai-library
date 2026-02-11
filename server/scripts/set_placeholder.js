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
        console.log('Connected. Setting placeholder...');

        // Update to a specific placeholder or a known valid URL
        // Using a reliable placeholder service
        const newImage = 'https://placehold.co/400x600/png?text=Science+and+Hypothesis';

        const book = await Book.findOne({ title: { $regex: 'Science and Hypothesis', $options: 'i' } });
        if (book) {
            book.image = newImage;
            await book.save();
            console.log(`Updated "${book.title}" to placeholder: ${newImage}`);
        } else {
            console.log('Book not found.');
        }

        await mongoose.connection.close();
    })
    .catch(err => {
        console.error('Connection Error:', err);
        process.exit(1);
    });

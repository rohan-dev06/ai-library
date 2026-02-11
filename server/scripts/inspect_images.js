console.log('Starting script...');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
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
        // Find specific book first
        const book = await Book.findOne({ title: { $regex: 'Think and Grow Rich', $options: 'i' } });
        let output = '';
        if (book) {
            output += `Found Book: ${book.title}\nImage URL: ${book.image}\n`;
        } else {
            output += 'Book "Think and Grow Rich" not found.\n';
        }

        // List all books with potential issues (e.g. valid URL check)
        const allBooks = await Book.find({}, 'title image');
        output += '\n--- All Books ---\n';
        allBooks.forEach(b => {
            output += `Title: ${b.title}, Image: ${b.image}\n`;
        });

        fs.writeFileSync('images_debug.txt', output);
        console.log('Output written to images_debug.txt');

        await mongoose.connection.close();
    })
    .catch(err => {
        console.error('Connection Error:', err);
        process.exit(1);
    });

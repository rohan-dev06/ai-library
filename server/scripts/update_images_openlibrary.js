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
        console.log('Connected to MongoDB. Updating images...');

        // Find books with ISBNs
        const books = await Book.find({ isbn: { $exists: true, $ne: null } });
        console.log(`Found ${books.length} books with ISBNs.`);

        let updatedCount = 0;
        for (const book of books) {
            // Check if current image is Google Books (which we know is failing)
            if (book.image && book.image.includes('books.google.com')) {
                const newImage = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
                console.log(`Updating "${book.title}"`);
                console.log(`  Old: ${book.image}`);
                console.log(`  New: ${newImage}`);

                book.image = newImage;
                await book.save();
                updatedCount++;
            }
        }

        console.log(`\nUpdate Complete. Modified ${updatedCount} books.`);
        await mongoose.connection.close();
    })
    .catch(err => {
        console.error('Connection Error:', err);
        process.exit(1);
    });

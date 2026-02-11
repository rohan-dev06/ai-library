const axios = require('axios');
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

async function findCover() {
    try {
        console.log('Searching OpenLibrary for "Science and Hypothesis"...');
        // Search by title and author
        const searchUrl = 'https://openlibrary.org/search.json?title=Science+and+Hypothesis&author=Henri+Poincare';
        const res = await axios.get(searchUrl);

        const docs = res.data.docs;
        let coverId = null;

        // Find first doc with a cover_i
        for (const doc of docs) {
            if (doc.cover_i) {
                coverId = doc.cover_i;
                console.log(`Found Cover ID: ${coverId} from edition: ${doc.title}`);
                break;
            }
        }

        if (coverId) {
            const newImage = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
            console.log(`New Image URL: ${newImage}`);

            // Connect to DB and Update
            await mongoose.connect(process.env.MONGO_URI);
            const book = await Book.findOne({ title: { $regex: 'Science and Hypothesis', $options: 'i' } });
            if (book) {
                book.image = newImage;
                await book.save();
                console.log('Database updated successfully.');
            } else {
                console.log('Book not found in DB to update.');
            }
            await mongoose.connection.close();
        } else {
            console.log('No cover found in OpenLibrary search results.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

findCover();

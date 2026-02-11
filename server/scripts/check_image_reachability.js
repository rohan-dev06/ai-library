const axios = require('axios');
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
        console.log('Connected. Checking images...');
        const books = await Book.find({}, 'title image');
        let output = '';

        for (const book of books) {
            try {
                const res = await axios.get(book.image, {
                    timeout: 5000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                output += `[${res.status}] OK - ${book.title}\n`;
                console.log(`OK: ${book.title}`);
            } catch (err) {
                const status = err.response ? err.response.status : err.code;
                output += `[FAIL - ${status}] ${book.title} || URL: ${book.image}\n`;
                console.log(`FAIL: ${book.title}`);
            }
        }

        fs.writeFileSync('reachability_results.txt', output, 'utf8');
        console.log('Done. Results in reachability_results.txt');
        await mongoose.connection.close();
    })
    .catch(err => {
        console.error('Connection Error:', err);
        process.exit(1);
    });

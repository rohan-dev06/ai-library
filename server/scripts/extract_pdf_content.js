
const mongoose = require('mongoose');
const axios = require('axios');
const { PDFParse } = require('pdf-parse');
const Book = require('../models/Book');
const BookContent = require('../models/BookContent');

// Hardcoded URI for reliability
const mongoURI = 'mongodb+srv://rohandev:rohan4080@cluster0.crh5lm2.mongodb.net/ai-library?retryWrites=true&w=majority';

const extractContent = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Find books with a fileUrl (assuming PDFs or accessible URLs)
        const books = await Book.find({ fileUrl: { $exists: true, $ne: '' } });
        console.log(`Found ${books.length} books with file URLs.`);

        for (const book of books) {
            console.log(`Processing "${book.title}"...`);

            // Check if content already exists
            const existingContent = await BookContent.findOne({ bookId: book.id });
            if (existingContent) {
                console.log(`  - Content already exists. Skipping.`);
                continue;
            }

            if (!book.fileUrl) {
                console.log(`  - No fileUrl. Skipping.`);
                continue;
            }

            try {
                console.log(`  - Downloading PDF from ${book.fileUrl}...`);
                // Note: PDFParse v2 can take URL directly, but axios buffer might be safer for auth/control? 
                // The library says { url: link } works. Let's try direct URL first for simplicity, 
                // but since these are cloudinary URLs, they are public.
                // However, previous script used axios buffer. Let's stick to buffer to avoid library network quirks if any.

                const response = await axios.get(book.fileUrl, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data);

                console.log(`  - Extracting text...`);
                // New API
                const parser = new PDFParse({ data: buffer });
                const data = await parser.getText();
                await parser.destroy(); // Important to free memory

                const fullText = data.text;

                if (!fullText || fullText.trim().length === 0) {
                    console.log('  - No text extracted. Skipping.');
                    continue;
                }

                console.log(`  - Extracted ${fullText.length} characters.`);

                // Split into chunks (simple logic: ~3000 chars)
                const chunkSize = 3000;
                let chunks = [];
                for (let i = 0; i < fullText.length; i += chunkSize) {
                    chunks.push(fullText.substring(i, i + chunkSize));
                }

                console.log(`  - Saving ${chunks.length} chunks...`);

                for (let i = 0; i < chunks.length; i++) {
                    await BookContent.create({
                        bookId: book.id,
                        title: `Part ${i + 1}`,
                        text: chunks[i],
                        sequenceNumber: i + 1
                    });
                }
                console.log(`  - Done.`);

            } catch (err) {
                console.error(`  - Failed to process book: ${err.message}`);
                // Continue to next book
            }
        }

        console.log('Content extraction completed.');
        process.exit(0);

    } catch (error) {
        console.error('Script Error:', error);
        process.exit(1);
    }
};

extractContent();

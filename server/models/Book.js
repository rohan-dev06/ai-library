const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Keeping numeric ID for compatibility with existing frontend logic
    isbn: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls if some books don't have ISBN
    title: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    // publisher moved to Author model
    // authorBio moved to Author model
    rating: { type: Number, default: 0 },
    pages: { type: Number },
    language: { type: String },
    match: { type: String },
    image: { type: String }, // URL or path

    // E-Book specific fields
    bookType: { type: String, default: 'EBOOK', enum: ['EBOOK', 'PHYSICAL'] }, // Default to EBOOK
    fileUrl: { type: String }, // URL to PDF/EPUB
    fileType: { type: String, default: 'PDF' },

    available: { type: Boolean, default: true },
    description: { type: String },
    tags: [{ type: String }],
    // content moved to BookContent model
});

module.exports = mongoose.model('Book', bookSchema);

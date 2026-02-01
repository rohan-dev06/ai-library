const mongoose = require('mongoose');

const bookContentSchema = new mongoose.Schema({
    bookId: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    sequenceNumber: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient retrieval of book chapters in order
bookContentSchema.index({ bookId: 1, sequenceNumber: 1 });
// Text index for smart search
bookContentSchema.index({ text: 'text' });

module.exports = mongoose.model('BookContent', bookContentSchema);

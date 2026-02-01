const mongoose = require('mongoose');

const readingLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookId: {
        type: Number,
        required: true
    },
    currentPage: {
        type: Number,
        default: 1
    },
    totalPages: {
        type: Number,
        required: true
    },
    lastRead: {
        type: Date,
        default: Date.now
    },
    timeSpent: {
        type: Number, // Time in seconds
        default: 0
    },
    status: {
        type: String,
        enum: ['reading', 'completed', 'dropped'],
        default: 'reading'
    }
});

// Compound index to ensure one log per user per book
readingLogSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model('ReadingLog', readingLogSchema);

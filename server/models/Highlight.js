const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookId: {
        type: Number,
        required: true
    },
    page: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        default: ''
    },
    note: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: '#FFEB3B' // Yellow
    },
    type: {
        type: String,
        enum: ['highlight', 'bookmark', 'note'],
        default: 'highlight'
    },
    position: {
        type: mongoose.Schema.Types.Mixed, // Store selection coordinates if needed
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Highlight', highlightSchema);

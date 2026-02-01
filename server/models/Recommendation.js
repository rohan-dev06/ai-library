const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One recommendation set per user
    },
    recommendations: [{
        bookId: {
            type: Number,
            required: true
        },
        title: String, // Cached for quicker display
        image: String, // Cached for quicker display
        score: {
            type: Number,
            default: 0
        },
        reason: {
            type: String, // "Because you read X", "Trending", etc.
            default: ''
        }
    }],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    type: {
        type: String,
        enum: ['PURCHASE', 'ISSUE', 'FINE'],
        default: 'PURCHASE'
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'success'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payment', paymentSchema);

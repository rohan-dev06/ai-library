const mongoose = require('mongoose');

const bookIssueSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookId: {
        type: Number, // Using Number to match existing Book ID type
        ref: 'Book', // Assuming we will eventually update Book to use ObjectId or keep using virtuals/manual lookups if Book.id is custom
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['issued', 'returned', 'overdue'],
        default: 'issued'
    },
    fine: {
        type: Number,
        default: 0
    },
    lastFineCheck: {
        type: Date,
        default: Date.now
    },
    isFinePaid: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('BookIssue', bookIssueSchema);

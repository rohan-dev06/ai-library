const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        default: ''
    },
    image: {
        type: String, // URL to author image
        default: ''
    },
    publisher: {
        type: String, // Publisher name as stored string per user request
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Author', authorSchema);

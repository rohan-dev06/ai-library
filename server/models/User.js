const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    preferences: [{
        type: String
    }],
    isVerified: {
        type: Boolean,
        default: true
    },
    otp: {
        code: String,
        expiresAt: Date
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    coins: {
        type: Number,
        default: 1000
    },
    // issuedBooks and readingProgress have been moved to their own collections (BookIssue and ReadingLog)
});

// Hash password before saving
// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw new Error(err);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

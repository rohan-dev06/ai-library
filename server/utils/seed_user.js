const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config(); // Load .env from current directory

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'test_coin@example.com';
        await User.deleteOne({ email }); // Clean up old test user

        const user = new User({
            username: 'test_coin_user',
            email: email,
            password: 'password123', // Will be hashed by pre-save hook
            role: 'student',
            isVerified: true,
            coins: 1000,
            issuedBooks: [] // Empty array works for both, but new structure is [{bookId, title, dates...}]
        });

        await user.save();
        console.log('Test User Created:', user.email);

        process.exit();
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seedUser();

const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('--- Fine Deduction Reproduction Test ---');

        // 1. Setup User with known coins
        await mongoose.connect(process.env.MONGO_URI);
        let user = await User.findOne({ email: 'test_coin@example.com' });
        user.coins = 1000;
        user.issuedBooks = [];
        await user.save();
        console.log('User Reset: 1000 coins, 0 books.');

        // 2. Login
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'test_coin@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;

        // 3. Issue Book
        const issueRes = await axios.post(`${API_URL}/library/issue`, {
            bookId: 500,
            bookTitle: 'Fine Reproduction Book'
        }, { headers: { Authorization: token } });
        console.log('Book Issued. Costs 100. Balance:', issueRes.data.coins); // Should be 900

        // 4. Force Due Date to be 2 minutes ago (should be fine of 40 coins)
        user = await User.findOne({ email: 'test_coin@example.com' });
        const book = user.issuedBooks.find(b => b.bookId === 500);
        book.dueDate = new Date(Date.now() - 2 * 60 * 1000); // 2 mins ago
        await user.save();
        console.log('DB Hack: Set due date to 2 minutes ago.');

        // 5. Return Book via API
        const returnRes = await axios.post(`${API_URL}/library/return`, {
            bookId: 500
        }, { headers: { Authorization: token } });

        console.log('Return Response:', returnRes.data.message);
        console.log('Final Coins:', returnRes.data.coins);

        // Expect: 900 - 40 = 860.
        // Or if it was 1 min ago: 900 - 20 = 880.
        // diffMinutes = ceil((now - (now - 2min)) / 1min) = ceil(2) = 2. Fine = 40.

        if (returnRes.data.coins < 900) {
            console.log('✅ PASS: Coins were deducted.');
        } else {
            console.log('❌ FAIL: Coins NOT deducted.');
        }

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

runTest();

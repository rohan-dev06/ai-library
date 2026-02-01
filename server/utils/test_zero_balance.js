const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const API_URL = 'http://localhost:5000/api';

// Direct DB manipulation helper to avoid waiting for minutes
const setPastDueDate = async (email, bookId, minutesAgo) => {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email });
    const book = user.issuedBooks.find(b => b.bookId === bookId);
    if (book) {
        book.dueDate = new Date(Date.now() - minutesAgo * 60 * 1000);
        await user.save();
        console.log(`[DB Setup] Set due date to ${minutesAgo} minutes ago.`);
    }
    // Don't close connection here if running sequentially, but script will exit.
};

const runTest = async () => {
    try {
        console.log('--- Starting Zero Balance Stress Test ---');

        // 1. Login
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'test_coin@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log(`Initial Coins: ${loginRes.data.user.coins}`);

        // 2. Issue a book
        const bookId = 999;
        try {
            await axios.post(`${API_URL}/library/issue`, {
                bookId: bookId,
                bookTitle: 'Zero Balance Test Book'
            }, { headers: { Authorization: token } });
        } catch (e) { console.log("Book maybe already issued."); }

        // 3. Set Back Date directly in DB to simulate MASSIVE fine
        // Need fine > Current Coins (e.g. 1000). 
        // 20 coins/min. Need > 50 mins. Let's do 60 mins overdue.
        await setPastDueDate('test_coin@example.com', bookId, 60);

        // 4. Return Book - Should trigger Zero Balance
        console.log('\n4. Returning Book with Massive Fine...');
        const returnRes = await axios.post(`${API_URL}/library/return`, {
            bookId: bookId
        }, { headers: { Authorization: token } });

        console.log('Return Response:', returnRes.data.message);
        console.log('Final Coins:', returnRes.data.coins);
        console.log('Issued Books Count:', returnRes.data.issuedBooks.length);

        if (returnRes.data.coins === 0 && returnRes.data.issuedBooks.length === 0) {
            console.log('✅ PASS: Zero Balance Protocol Triggered.');
        } else {
            console.log('❌ FAIL: Protocol not triggered properly.');
        }

        process.exit();

    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
        process.exit(1);
    }
};

runTest();

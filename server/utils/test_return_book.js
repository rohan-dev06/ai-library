const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('--- Starting Return Book Test ---');

        // 1. Login
        console.log('\n1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'test_coin@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Logged in.');

        // 2. Issue a Book (Ensure we have one to return)
        console.log('\n2. Issuing Book ID 102...');
        try {
            await axios.post(`${API_URL}/library/issue`, {
                bookId: 102,
                bookTitle: 'Test Book For Return'
            }, { headers: { Authorization: token } });
            console.log('Book issued.');
        } catch (e) {
            console.log('Book might already be issued (Expected if running multiple times).');
        }

        // 3. Return the Book
        console.log('\n3. Returning Book ID 102...');
        const returnRes = await axios.post(`${API_URL}/library/return`, {
            bookId: 102
        }, { headers: { Authorization: token } });

        console.log('Return Response:', returnRes.data);

        // 4. Verify user data (Optional, could check dashboard)
        // For now, response verification is enough if coins/issuedBooks returned are correct.

        console.log('\n--- Test Completed Successfully ---');

    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
        process.exit(1);
    }
};

runTest();

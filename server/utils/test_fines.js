const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('--- Starting Rapid Fine & Zero Balance Test ---');

        // 1. Login
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'khatikr321@gmail.com', // Using the migrated user for variety or seeded? Let's use seed user to be safe reset
            password: 'password123'
        }).catch(async () => {
            // Fallback to seeding if login fails/user expects clean state
            console.log('Login failed, running seed...');
            // Wait can't run seed from here comfortably without exec. 
            // Assume user exists or use seed user: test_coin@example.com
            return await axios.post(`${API_URL}/auth/login`, {
                email: 'test_coin@example.com',
                password: 'password123'
            });
        });

        let token = loginRes.data.token;
        // Ensure we have coins to burn
        if (loginRes.data.user.coins < 200) console.log("Warning: Low coins.");

        // 2. Issue a Book
        console.log('\n2. Issuing Book...');
        const issueRes = await axios.post(`${API_URL}/library/issue`, {
            bookId: 999,
            bookTitle: 'Fine Test Book'
        }, { headers: { Authorization: token } });
        console.log(`Book Issued. Due Date: ${new Date(Date.now() + 60 * 1000)}`);

        // 3. Wait for 65 seconds to trigger fine
        console.log('\n3. Waiting 65s for fine to accrue...');
        await new Promise(resolve => setTimeout(resolve, 65000));

        // 4. Check Dashboard for Fines
        console.log('\n4. Checking Dashboard...');
        const dashRes = await axios.get(`${API_URL}/library/dashboard`, { headers: { Authorization: token } });
        console.log(`Total Fines: ${dashRes.data.totalFines}`);
        console.log(`Book Status: ${dashRes.data.issuedBooks.find(b => b.bookId === 999)?.status}`);

        // 5. Return Book (Should deduct fine)
        console.log('\n5. Returning Book...');
        const returnRes = await axios.post(`${API_URL}/library/return`, {
            bookId: 999
        }, { headers: { Authorization: token } });

        console.log('Return Response:', returnRes.data.message);
        console.log('Remaining Coins:', returnRes.data.coins);

        console.log('\n--- Test Completed ---');

    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
};

runTest();

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('--- Starting Issue Book Flow Test ---');

        // 1. Login to get token
        console.log('\n1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'test_coin@example.com',
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log(`Logged in. User: ${loginRes.data.user.email}`);
        console.log(`Initial Coins: ${loginRes.data.user.coins}`);

        if (loginRes.data.user.coins !== 1000) {
            throw new Error(`Expected 1000 initial coins, got ${loginRes.data.user.coins}`);
        }

        // 2. Issue a Book
        console.log('\n2. Issuing Book ID 101...');
        const issueRes = await axios.post(`${API_URL}/library/issue`, {
            bookId: 101,
            bookTitle: 'Test Book'
        }, {
            headers: { Authorization: token }
        });

        console.log('Issue Response:', issueRes.data);
        if (issueRes.data.coins !== 900) throw new Error('Coins not deducted correctly! Expected 900.');

        // 3. Issue same book again
        console.log('\n3. Issuing Book ID 101 again (should fail)...');
        try {
            await axios.post(`${API_URL}/library/issue`, {
                bookId: 101,
                bookTitle: 'Test Book'
            }, {
                headers: { Authorization: token }
            });
            console.log('ERROR: Should have failed!');
        } catch (err) {
            console.log('Success: Failed as expected:', err.response?.data?.message);
        }

        console.log('\n--- Test Completed Successfully ---');

    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
        process.exit(1);
    }
};

runTest();

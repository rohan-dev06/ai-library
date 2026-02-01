const axios = require('axios');
require('dotenv').config({ path: '../.env' }); // Adjust path if running from utils

const login = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test_coin@example.com',
            password: 'password123'
        });
        return res.data.token;
    } catch (error) {
        console.error('Login Failed:', error.response?.data?.message || error.message);
        process.exit(1);
    }
};

const testDashboard = async () => {
    try {
        console.log('Logging in...');
        const token = await login();
        console.log('Logged in. Token acquired.');

        console.log('Fetching Dashboard Data...');
        const res = await axios.get('http://localhost:5000/api/library/dashboard', {
            headers: { Authorization: token }
        });

        console.log('Dashboard Data Received:');
        console.log('Coins:', res.data.coins);
        console.log('Issued Books Count:', res.data.issuedBooks.length);
        if (res.data.issuedBooks.length > 0) {
            console.log('Sample Book:', res.data.issuedBooks[0]);
        }
        console.log('Total Fines:', res.data.totalFines);
        console.log('Recommendations:', res.data.recommendations.length);

        console.log('Test Passed ✅');
    } catch (error) {
        console.error('Dashboard Test Failed ❌:', error.response?.data || error.message);
    }
};

testDashboard();

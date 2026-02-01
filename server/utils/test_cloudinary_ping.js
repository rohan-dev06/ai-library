const axios = require('axios');

const testPing = async () => {
    try {
        // 1. Login
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@gmail.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('Got Admin Token');

        // 2. Ping
        const res = await axios.get('http://localhost:5000/api/admin/debug-upload-test', {
            headers: { 'Authorization': token }
        });

        console.log('Ping Result:', res.data);

    } catch (error) {
        console.error('Ping Failed:', error.response?.data || error.message);
    }
};

testPing();

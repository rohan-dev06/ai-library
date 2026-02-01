const axios = require('axios');

const test = async () => {
    try {
        console.log('Testing Forgot Password API...');
        const res = await axios.post('http://localhost:5000/api/auth/forgot-password', {
            email: 'student_real_1@test.com'
        });
        console.log('Success:', res.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

test();

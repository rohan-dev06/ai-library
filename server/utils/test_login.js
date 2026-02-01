const axios = require('axios');

const test = async () => {
    try {
        console.log('Testing Login API...');
        // Use random email that definitely doesn't exist to force a User.findOne()
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'nonexistent_user_for_db_check@test.com',
            password: 'password'
        });
        console.log('Success (Unexpected 200 OK):', res.data);
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('Success (Expected 400 Invalid Credentials): DB Connection is OK.');
        } else {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }
};

test();

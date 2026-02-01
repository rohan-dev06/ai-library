
const axios = require('axios');

const checkApi = async () => {
    try {
        console.log('Fetching books from API...');
        const res = await axios.get('http://localhost:5000/api/library/books');
        console.log(`Status: ${res.status}`);
        console.log(`Count: ${res.data.length}`);
        if (res.data.length > 0) {
            console.log('First Book Sample:');
            console.log(JSON.stringify(res.data[0], null, 2));
        } else {
            console.log('No books returned.');
        }
    } catch (error) {
        console.error('API Error:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
};

checkApi();

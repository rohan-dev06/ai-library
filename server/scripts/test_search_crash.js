const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const testSearch = async () => {
    try {
        const formData = new FormData();
        formData.append('query', 'History of India');
        formData.append('type', 'text');

        const res = await axios.post('http://localhost:5000/api/library/search/smart', formData, {
            headers: formData.getHeaders(),
            validateStatus: () => true
        });

        console.log('Status:', res.status);
        console.log('Data Type of results:', Array.isArray(res.data.results) ? 'Array' : typeof res.data.results);

        if (res.data.results && res.data.results.length > 0) {
            const firstBook = res.data.results[0];
            console.log('First Book Author Type:', typeof firstBook.author);
            console.log('First Book Author Value:', firstBook.author);

            if (typeof firstBook.author === 'string') {
                console.log('✅ PASS: Author is a string');
            } else {
                console.error('❌ FAIL: Author is NOT a string');
            }
        } else {
            console.log('No results to verify');
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
};

testSearch();

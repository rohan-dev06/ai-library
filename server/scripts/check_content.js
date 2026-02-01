
const axios = require('axios');

const checkContent = async () => {
    try {
        // Book 1, Page 1 (Sequence 1)
        const res = await axios.get('http://localhost:5000/api/library/book/1/content?page=1');
        console.log('Status:', res.status);
        if (res.data) {
            console.log('Title:', res.data.title);
            console.log('Text Length:', res.data.text.length);
            console.log('First 100 chars:', res.data.text.substring(0, 100));
        }
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) console.error('Data:', error.response.data);
    }
};

checkContent();

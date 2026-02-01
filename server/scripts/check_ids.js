
const axios = require('axios');

const checkIds = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/library/books');
        console.log(`Total Books: ${res.data.length}`);
        const ids = res.data.map(b => b.id);
        console.log('Book IDs:', ids.join(', '));
    } catch (error) {
        console.error('Error:', error.message);
    }
};

checkIds();

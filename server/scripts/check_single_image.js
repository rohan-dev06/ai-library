const axios = require('axios');

const url = 'https://covers.openlibrary.org/b/isbn/9780486602216-L.jpg';

axios.get(url, { responseType: 'arraybuffer' })
    .then(res => {
        console.log(`Status: ${res.status}`);
        console.log(`Length: ${res.data.length} bytes`);
        if (res.data.length < 1000) {
            console.log('Image likely too small/blank.');
        } else {
            console.log('Image seems valid size.');
        }
    })
    .catch(err => {
        console.error('Error fetching image:', err.message);
    });

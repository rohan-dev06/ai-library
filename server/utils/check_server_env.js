const axios = require('axios');

axios.get('http://localhost:5000/debug-env')
    .then(res => {
        console.log('Server Env Check:', res.data);
    })
    .catch(err => {
        console.error('Check Failed:', err.message);
    });

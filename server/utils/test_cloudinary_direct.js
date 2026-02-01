const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing Cloudinary Connection...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
// Don't log secrets

cloudinary.api.ping()
    .then(res => {
        console.log('Connection Successful:', res);
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection Failed:', err);
        process.exit(1);
    });

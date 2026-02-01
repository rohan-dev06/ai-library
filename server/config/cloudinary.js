const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

console.log('DEBUG: Initializing Cloudinary Config');
try {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('DEBUG: Cloudinary Configured:', cloudinary.config().cloud_name);
} catch (err) {
    console.error('DEBUG: Cloudinary Config Error:', err);
}

let storage;
try {
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'library_ebooks',
            allowed_formats: ['pdf', 'epub'],
            resource_type: 'raw'
        }
    });
    console.log('DEBUG: Storage Initialized');
} catch (err) {
    console.error('DEBUG: Storage Init Error:', err);
    // Create dummy storage to prevent crash
    storage = multer.memoryStorage();
}

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };

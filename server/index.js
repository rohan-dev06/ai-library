const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
console.log('DEBUG: Env Loaded. Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'UNDEFINED');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Email User Configured:', process.env.EMAIL_USER ? 'YES' : 'NO');
console.log('Email Pass Configured:', process.env.EMAIL_PASS ? 'YES' : 'NO');

// Middleware
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(cors({
    origin: '*', // Allow all for dev
    credentials: true
}));

// Routes
const authRoutes = require('./routes/auth');
const libraryRoutes = require('./routes/library');
app.use('/api/auth', authRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/highlights', require('./routes/highlight'));

// Serve static uploads
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('AI Library Management System API is running...');
});

app.get('/debug-env', (req, res) => {
    res.json({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'MISSING',
        api_key_exists: !!process.env.CLOUDINARY_API_KEY,
        api_secret_exists: !!process.env.CLOUDINARY_API_SECRET
    });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    tls: true,
    tlsAllowInvalidCertificates: true, // Fix for local SSL issues
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Increase timeout to 10 minutes for large file uploads
server.setTimeout(10 * 60 * 1000);

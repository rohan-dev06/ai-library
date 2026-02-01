const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
require('dotenv').config();

const testUserEmail = 'admin_test@library.edu';
const testBookId = 9999;
const password = 'password123';

async function testAdminFlow() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Create Admin User
        await User.deleteOne({ email: testUserEmail });
        const adminUser = new User({
            username: 'admin_test',
            email: testUserEmail,
            password: password,
            role: 'admin',
            isVerified: true
        });
        await adminUser.save();
        console.log('Admin user created');

        // 2. Login
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: testUserEmail,
            password: password
        });
        const token = loginRes.data.token;
        console.log('Logged in, token received');

        // 3. Add Book as Admin
        await Book.deleteOne({ id: testBookId });
        const bookData = {
            id: testBookId,
            title: 'Test Admin Book',
            author: 'Admin User',
            description: 'A book added by admin test script',
            image: 'http://example.com/img.jpg',
            rating: 5,
            pages: 100,
            language: 'English',
            tags: 'test, admin',
            available: true
        };

        const addRes = await axios.post('http://localhost:5000/api/admin/add-book', bookData, {
            headers: { 'Authorization': token }
        });
        console.log('Book added:', addRes.data.message);

        // 4. Verify in DB
        const book = await Book.findOne({ id: testBookId });
        if (book) {
            console.log('SUCCESS: Book found in DB');
        } else {
            console.error('FAILURE: Book not found in DB');
        }

    } catch (error) {
        console.error('TEST FAILED:', error.response ? error.response.data : error.message);
    } finally {
        await mongoose.disconnect();
    }
}

testAdminFlow();

const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Recommendation = require('../models/Recommendation');
const User = require('../models/User');

async function verifyRecs() {
    try {
        if (!process.env.MONGO_URI) {
            console.log("No MONGO_URI, skipping DB test.");
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Check if model works
        const rec = new Recommendation({
            userId: new mongoose.Types.ObjectId(), // Fake ID
            recommendations: [{ bookId: 1, title: 'Test Book', score: 10 }]
        });

        // Validate
        const err = rec.validateSync();
        if (err) {
            console.error('Validation failed:', err);
        } else {
            console.log('Recommendation model valid.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyRecs();

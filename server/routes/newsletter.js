const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    try {
        // Check if already subscribed
        let subscriber = await Subscriber.findOne({ email });
        if (subscriber) {
            return res.status(400).json({ message: 'You are already subscribed!' });
        }

        subscriber = new Subscriber({ email });
        await subscriber.save();

        res.status(201).json({ message: 'Successfully subscribed to newsletter!' });
    } catch (error) {
        console.error('Newsletter Subscription Error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

module.exports = router;

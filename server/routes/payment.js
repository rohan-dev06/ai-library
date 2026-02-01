const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// @route   POST /api/payment/create
// @desc    Create a new payment and add coins to user
// @access  Private
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { amount, paymentMethod } = req.body;

        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        // Create payment record
        const payment = new Payment({
            userId: req.user.userId,
            username: req.user.username, // stored for easier history display
            amount,
            currency: 'USD', // Default or dynamic
            status: 'success', // Simulating successful payment
            type: 'PURCHASE',
            description: 'Coin Purchase'
        });

        await payment.save();

        // Add coins to user
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.coins += amount;
        await user.save();

        res.status(201).json({
            message: 'Payment successful',
            coins: user.coins,
            payment
        });

    } catch (err) {
        console.error("Payment error:", err);
        res.status(500).json({ message: 'Server error processing payment' });
    }
});

// @route   GET /api/payment/my-history
// @desc    Get logged in user's payment history
// @access  Private
router.get('/my-history', verifyToken, async (req, res) => {
    try {
        const history = await Payment.find({ userId: req.user.userId }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        console.error("Error fetching history:", err);
        res.status(500).json({ message: 'Server error fetching history' });
    }
});

// @route   GET /api/payment/all
// @desc    Get all payment history (Admin only) - Purchases Only
// @access  Private/Admin
router.get('/all', verifyToken, verifyAdmin, async (req, res) => {
    try {
        // Match PURCHASES or old records (where type doesn't exist)
        const payments = await Payment.find({
            $or: [
                { type: 'PURCHASE' },
                { type: { $exists: false } }
            ]
        }).sort({ date: -1 });
        res.json(payments);
    } catch (err) {
        console.error("Error fetching payments:", err);
        res.status(500).json({ message: 'Server error fetching payments' });
    }
});

module.exports = router;

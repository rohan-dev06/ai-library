const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Build the OR query dynamically to check only provided fields
        const orConditions = [{ email }, { username }];

        // Check if user already exists
        const existingUser = await User.findOne({ $or: orConditions });

        if (existingUser) {
            let message = 'User already exists';
            if (existingUser.email === email) message = 'Email already exists';
            else if (existingUser.username === username) message = 'Username already exists';

            return res.status(400).json({ message });
        }

        // Default role is 'user'
        // Default role is 'user'
        let role = 'user';

        const user = new User({
            username,
            email,
            password,
            role,
            isVerified: true
        });

        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registration successful.',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                coins: user.coins,
                issuedBooks: user.issuedBooks
            }
        });


    } catch (error) {
        console.error('Registration error:', error, error.message, error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.otp.code !== otp || user.otp.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined; // Clear OTP
        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Verification successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                coins: user.coins,
                issuedBooks: user.issuedBooks
            }
        });

    } catch (error) {
        console.error('OTP Verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been blocked by the administrator.' });
        }



        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                coins: user.coins,
                issuedBooks: user.issuedBooks
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Forgot Password - Initiate
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        user.otp = {
            code: otpCode,
            expiresAt: otpExpiresAt
        };
        await user.save();

        // Send OTP via Email
        const emailSent = await sendEmail(email, 'Password Reset OTP', `Your Password Reset OTP is: ${otpCode}`);

        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send OTP email.' });
        }

        res.json({ message: 'OTP sent to your email.' });
    } catch (error) {
        console.error('Forgot Password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify Password OTP
router.post('/verify-pass-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.otp || !user.otp.code || user.otp.code !== otp || new Date(user.otp.expiresAt).getTime() < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Generate temporary Reset Token (valid for 5 mins)
        const resetToken = jwt.sign(
            { userId: user._id, purpose: 'password_reset' },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        res.json({ message: 'OTP verified', resetToken });
    } catch (error) {
        console.error('Verify Pass OTP error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken) {
            return res.status(400).json({ message: 'Token required' });
        }

        // Verify Token
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        if (decoded.purpose !== 'password_reset') {
            return res.status(400).json({ message: 'Invalid token purpose' });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update Password
        user.password = newPassword;
        user.otp = undefined; // Clear OTP
        await user.save();

        res.json({ message: 'Password reset successful. Please login.' });
    } catch (error) {
        console.error('Reset Password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;

        // Update lastActive (Fire and forget, don't await strictly to block response)
        User.findByIdAndUpdate(req.user.userId, { lastActive: Date.now() }).catch(err => console.error('LastActive Update Error:', err));

        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

const verifyAdmin = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;

        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        // Update lastActive (Fire and forget)
        User.findByIdAndUpdate(req.user.userId, { lastActive: Date.now() }).catch(err => console.error('Admin LastActive Update Error:', err));

        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

module.exports = { verifyToken, verifyAdmin };

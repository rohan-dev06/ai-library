const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { verifyToken } = require('../middleware/auth');

// @route   GET /api/reviews/:bookId
// @desc    Get all reviews for a book
// @access  Public
router.get('/:bookId', async (req, res) => {
    try {
        const reviews = await Review.find({ bookId: req.params.bookId }).sort({ date: -1 });
        res.json(reviews);
    } catch (err) {
        console.error("Error fetching reviews:", err);
        res.status(500).json({ message: 'Server error fetching reviews' });
    }
});

// @route   POST /api/reviews/add
// @desc    Add a review
// @access  Private
router.post('/add', verifyToken, async (req, res) => {
    try {
        const { bookId, rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Please provide a valid rating (1-5)' });
        }

        // Check for existing review
        let review = await Review.findOne({ bookId, userId: req.user.userId });

        if (review) {
            // Update existing review
            review.rating = rating;
            review.comment = comment;
            review.date = Date.now();
            await review.save();
            return res.status(200).json({ review, message: 'Review updated' });
        }

        // Create new review
        review = new Review({
            bookId,
            userId: req.user.userId,
            username: req.user.username,
            rating,
            comment
        });

        await review.save();
        res.status(201).json({ review, message: 'Review added' });

    } catch (err) {
        console.error("Error adding/updating review:", err);
        res.status(500).json({ message: 'Server error saving review' });
    }
});

module.exports = router;

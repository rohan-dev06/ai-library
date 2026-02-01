const express = require('express');
const router = express.Router();
const Highlight = require('../models/Highlight');
const { verifyToken } = require('../middleware/auth');

// Get all highlights for a book
router.get('/:bookId', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const bookId = Number(req.params.bookId);

        const highlights = await Highlight.find({ userId, bookId }).sort({ page: 1, createdAt: 1 });
        res.json(highlights);
    } catch (error) {
        console.error('Get Highlights Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new highlight/bookmark/note
router.post('/add', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { bookId, page, text, note, color, type, position } = req.body;

        if (!bookId || !page) {
            return res.status(400).json({ message: 'Book ID and page are required' });
        }

        const highlight = new Highlight({
            userId,
            bookId,
            page,
            text: text || '',
            note: note || '',
            color: color || '#FFEB3B',
            type: type || 'highlight',
            position: position || {}
        });

        await highlight.save();
        res.status(201).json({ message: 'Saved successfully', highlight });
    } catch (error) {
        console.error('Add Highlight Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update highlight/note
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const highlightId = req.params.id;
        const { text, note, color } = req.body;

        const highlight = await Highlight.findOne({ _id: highlightId, userId });
        if (!highlight) {
            return res.status(404).json({ message: 'Highlight not found' });
        }

        if (text !== undefined) highlight.text = text;
        if (note !== undefined) highlight.note = note;
        if (color !== undefined) highlight.color = color;

        await highlight.save();
        res.json({ message: 'Updated successfully', highlight });
    } catch (error) {
        console.error('Update Highlight Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete highlight
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const highlightId = req.params.id;

        const highlight = await Highlight.findOneAndDelete({ _id: highlightId, userId });
        if (!highlight) {
            return res.status(404).json({ message: 'Highlight not found' });
        }

        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Delete Highlight Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-library')
    .then(async () => {
        const recommendations = [{ bookId: 101 }, { bookId: 102 }]; // Let's pretend we have 2

        const issues = await mongoose.connection.db.collection('bookissues').find({}).toArray();
        const logs = await mongoose.connection.db.collection('readinglogs').find({}).toArray();

        let excludeIds = [
            ...issues.map(i => i.bookId),
            ...logs.map(r => r.bookId)
        ];

        const extraBooks = await Book.find({
            id: { $nin: [...excludeIds, ...recommendations.map(r => r.bookId)] }
        });
        console.log("Excluded IDs:", excludeIds);
        console.log("Found extras:", extraBooks.length);
        console.log("Extras IDs:", extraBooks.map(b => b.id));
        process.exit(0);
    })
    .catch(console.error);

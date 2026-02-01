
const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://rohandev:rohan4080@cluster0.crh5lm2.mongodb.net/ai-library?retryWrites=true&w=majority';

mongoose.connect(mongoURI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const book = await mongoose.connection.db.collection('books').findOne({});
        console.log('Sample Book:', JSON.stringify(book, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });

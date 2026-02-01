
const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://rohandev:rohan4080@cluster0.crh5lm2.mongodb.net/ai-library?retryWrites=true&w=majority';

mongoose.connect(mongoURI)
    .then(async () => {
        const count = await mongoose.connection.db.collection('bookcontents').countDocuments();
        console.log(`BookContents Count: ${count}`);
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });

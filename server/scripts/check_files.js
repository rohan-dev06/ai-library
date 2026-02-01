
const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://rohandev:rohan4080@cluster0.crh5lm2.mongodb.net/ai-library?retryWrites=true&w=majority';

mongoose.connect(mongoURI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const books = await mongoose.connection.db.collection('books').find({}, { projection: { title: 1, fileUrl: 1, fileType: 1 } }).toArray();
        console.log('Books with File URLs:');
        books.forEach(b => {
            console.log(`- ${b.title}: [${b.fileType}] ${b.fileUrl ? b.fileUrl.substring(0, 50) + '...' : 'NO URL'}`);
        });
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });


const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Hardcoded for debugging purposes to bypass dotenv issues
const mongoURI = 'mongodb+srv://rohandev:rohan4080@cluster0.crh5lm2.mongodb.net/ai-library?retryWrites=true&w=majority';

console.log('Connecting to MongoDB...');

mongoose.connect(mongoURI)
    .then(async () => {
        console.log('Connected to MongoDB');
        try {
            const collections = await mongoose.connection.db.listCollections().toArray();
            let output = 'Collections:\n';
            for (const col of collections) {
                const count = await mongoose.connection.db.collection(col.name).countDocuments();
                output += `- ${col.name}: ${count} documents\n`;
            }
            console.log(output);
            fs.writeFileSync(path.join(__dirname, 'collections.txt'), output);
        } catch (e) {
            console.error('Error listing collections:', e);
            fs.writeFileSync(path.join(__dirname, 'collections.txt'), 'Error: ' + e.message);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection Error:', err);
        process.exit(1);
    });

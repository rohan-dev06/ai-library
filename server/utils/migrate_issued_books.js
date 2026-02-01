const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Access raw collection to avoid Schema validation errors during fetch
        const usersCollection = mongoose.connection.collection('users');
        const users = await usersCollection.find({}).toArray();

        console.log(`Found ${users.length} users. Checking for legacy data...`);

        for (const user of users) {
            // Check if issuedBooks exists and has numbers
            if (user.issuedBooks && user.issuedBooks.length > 0 && typeof user.issuedBooks[0] === 'number') {
                console.log(`Migrating user: ${user.email}`);

                const newIssuedBooks = user.issuedBooks.map(bookId => {
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + 7);
                    return {
                        bookId: bookId,
                        title: 'Legacy Book (Title Unknown)', // Default title since we don't have it easily here
                        issueDate: new Date(),
                        dueDate: dueDate
                    };
                });

                await usersCollection.updateOne(
                    { _id: user._id },
                    { $set: { issuedBooks: newIssuedBooks } }
                );
                console.log(`Migrated ${user.email} successfully.`);
            }
        }

        console.log('Migration Completed.');
        process.exit();
    } catch (error) {
        console.error('Migration Error:', error);
        process.exit(1);
    }
};

migrate();

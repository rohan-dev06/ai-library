const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'khatikr321@gmail.com' });

        if (user) {
            console.log(`User: ${user.email}`);
            console.log(`Coins: ${user.coins}`);
            console.log(`Issued Books: ${user.issuedBooks.length}`);
            user.issuedBooks.forEach(b => console.log(` - ${b.title} (Due: ${b.dueDate})`));
        } else {
            console.log('User not found');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();

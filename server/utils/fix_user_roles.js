const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fixRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find users with roles NOT in ['user', 'admin']
        // Or just update all "student" roles to "user" logic?
        // Since we know 'student' was the old default probably.

        const validRoles = ['user', 'admin'];

        // This query might not work if schema invalidates read? No, find works, save fails.
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        let updatedCount = 0;
        for (const user of users) {
            if (!validRoles.includes(user.role)) {
                console.log(`User ${user.email} has invalid role: ${user.role}. Updating to 'user'.`);
                user.role = 'user';
                // Also check any other potential schema violations?
                // 'isVerified' required? defaulted.
                try {
                    await user.save();
                    updatedCount++;
                } catch (err) {
                    console.error(`Failed to save user ${user.email}:`, err.message);
                }
            }
        }

        console.log(`Fixed ${updatedCount} users.`);
        process.exit(0);

    } catch (error) {
        console.error('Fix Error:', error);
        process.exit(1);
    }
};

fixRoles();

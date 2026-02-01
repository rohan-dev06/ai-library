
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Notification = require('../models/Notification');

const seedNotifications = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const users = await User.find({});
        console.log(`Found ${users.length} users`);

        if (users.length === 0) {
            console.log('No users found to seed notifications for.');
            process.exit(0);
        }

        const notificationTemplates = [
            { message: "Welcome to SmartLib! Start by setting your reading goals.", type: "info" },
            { message: "Your weekly reading summary is ready.", type: "success" },
            { message: "New arrival: 'Atomic Habits' is now available.", type: "info" },
            { message: "Reminder: You have a book due in 3 days.", type: "warning" },
            { message: "Maintenance scheduled for Sunday 2 AM.", type: "error" }, // utilizing 'error' type for system alerts
            { message: "You earned 50 coins for finishing a chapter!", type: "success" }
        ];

        let totalCreated = 0;

        for (const user of users) {
            // Check if user already has notifications to avoid duplicate spam if run multiple times
            const count = await Notification.countDocuments({ userId: user._id });
            if (count > 0 && process.argv[2] !== '--force') {
                console.log(`Skipping ${user.username} (already has notifications). Use --force to override.`);
                continue;
            }

            // Create 3 random notifications for each user
            const userNotifications = [];
            for (let i = 0; i < 3; i++) {
                const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
                userNotifications.push({
                    userId: user._id,
                    message: template.message,
                    type: template.type,
                    isRead: Math.random() > 0.7, // 30% chance of being read
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)) // Random time in past
                });
            }

            await Notification.insertMany(userNotifications);
            totalCreated += userNotifications.length;
            console.log(`Added 3 notifications for ${user.username}`);
        }

        console.log(`Seed completed. Total notifications created: ${totalCreated}`);

    } catch (error) {
        console.error('Seed Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedNotifications();

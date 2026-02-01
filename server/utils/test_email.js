require('dotenv').config();
const sendEmail = require('./sendEmail');

const test = async () => {
    console.log('Testing email sending...');
    console.log('User:', process.env.EMAIL_USER);
    // Don't log password

    const result = await sendEmail(process.env.EMAIL_USER, 'Test Email', 'This is a test email from the server.');
    console.log('Result:', result);
};

test();

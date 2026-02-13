const nodemailer = require('nodemailer');

// Create transporter outside to reuse connection pool (optional, but good for verification)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Fail fast if connection hangs
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
});

const verifyConfig = async () => {
    try {
        await transporter.verify();
        console.log('✅ SMTP Server is ready to take our messages');
        return true;
    } catch (error) {
        console.error('❌ SMTP Connection Error:', error);
        return false;
    }
};

const sendEmail = async (to, subject, text) => {
    try {
        console.log(`Sending email to: ${to}, Subject: ${subject}`);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully. MessageID:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        console.error('Stack:', error.stack);
        return false;
    }
};

module.exports = { sendEmail, verifyConfig };

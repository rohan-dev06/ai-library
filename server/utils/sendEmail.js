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
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', to);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendEmail, verifyConfig };

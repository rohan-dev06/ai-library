require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({});
        if (!user) throw new Error("No user found to test with");

        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log("Generated Token. Testing API...");

        const res = await axios.post('http://localhost:5000/api/payment/paypal/create-order',
            { price: '4.50' },
            { headers: { Authorization: token } }
        );

        console.log("SUCCESS! Response Data:");
        console.dir(res.data, { depth: null });
        process.exit(0);
    } catch (e) {
        console.error("API CALL FAILED:");
        if (e.response && e.response.data) {
            console.error(e.response.data);
        } else {
            console.error(e.message);
        }
        process.exit(1);
    }
})();

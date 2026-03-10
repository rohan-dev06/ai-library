require('dotenv').config();
const { createOrder } = require('./utils/paypal');

(async () => {
    try {
        console.log("Testing PayPal Order Creation...");
        const order = await createOrder("5.00");
        console.log("SUCCESS! Order ID:", order.id);
        process.exit(0);
    } catch (e) {
        console.error("FAILED:", e.message);
        if (e.response && e.response.data) console.error(e.response.data);
        process.exit(1);
    }
})();

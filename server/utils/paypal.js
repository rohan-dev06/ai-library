const axios = require('axios');

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const base = "https://api-m.sandbox.paypal.com"; // Switch to live in production

/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 */
const generateAccessToken = async () => {
    try {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            throw new Error("MISSING_API_CREDENTIALS");
        }
        const auth = Buffer.from(
            PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET,
        ).toString("base64");

        // axios uses data config for body in POST
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');

        const response = await axios.post(`${base}/v1/oauth2/token`, params, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        return response.data.access_token;
    } catch (error) {
        console.error("Failed to generate Access Token:", error.message);
        throw error;
    }
};

/**
 * Create an order to start the transaction.
 */
const createOrder = async (cartValue) => {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    const payload = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: cartValue,
                },
            },
        ],
    };

    const response = await axios.post(url, payload, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

    return response.data;
};

/**
 * Capture payment for the created order to complete the transaction.
 */
const captureOrder = async (orderID) => {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;

    const response = await axios.post(url, {}, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

    return response.data;
};

module.exports = {
    createOrder,
    captureOrder,
};

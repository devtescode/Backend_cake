const axios = require("axios");
require("dotenv").config();

module.exports.initialize = async (req, res) => {
    const { email, amount, currency } = req.body;

    if (!email || !amount) {
        return res.status(400).json({ error: "Email and amount are required" });
    }

    try {
        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email,
                amount: amount * 100,
                currency: currency || "NGN", // default to NGN if not provided
                metadata: { email },
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.API_SECRET_PAYSTACK}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error("Paystack initialization error:", error.response?.data || error.message);
        res.status(500).json({ error: "Payment initialization failed" });
    }
};

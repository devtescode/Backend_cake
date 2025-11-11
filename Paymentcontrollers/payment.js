const axios = require("axios");
require("dotenv").config();

module.exports.initialize = async (req, res) => {
  const { email, amount, currency, metadata } = req.body;

  // ✅ Validate required fields
  if (!email || !amount || !metadata) {
    return res.status(400).json({
      error: "Email, amount, and metadata (orders) are required",
    });
  }

  // ✅ Ensure amount is a valid number
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  // ✅ Validate currency (default to NGN)
  const supportedCurrencies = ["NGN"];
  const selectedCurrency =
    currency && supportedCurrencies.includes(currency.toUpperCase())
      ? currency.toUpperCase()
      : "NGN";

  try {
    // ✅ Initialize Paystack transaction
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: Math.round(amount * 100), // Paystack expects amount in kobo
        currency: selectedCurrency,
        metadata, // This now includes allOrders or any other info
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
    console.error(
      "Paystack initialization error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Payment initialization failed",
      details: error.response?.data || error.message,
    });
  }
};

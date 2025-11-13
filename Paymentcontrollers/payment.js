const axios = require("axios");
require("dotenv").config();
const orderModel = require("../Models/order.model");

// ✅ Initialize Paystack Payment
module.exports.initialize = async (req, res) => {
  const { email, amount, currency, metadata } = req.body;

  // ✅ Validate required fields
  if (!email || !amount || !metadata) {
    return res.status(400).json({
      error: "Email, amount, and metadata (orders) are required",
    });
  }

  // ✅ Ensure amount is valid
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  // ✅ Validate currency (default NGN)
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
        metadata, // contains allOrders IDs
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_SECRET_PAYSTACK}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ Send Paystack response back to frontend
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

// ✅ Verify Paystack Payment
module.exports.verify = async (req, res) => {
  const { reference } = req.params;

  if (!reference) {
    return res.status(400).json({ error: "Reference is required" });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_SECRET_PAYSTACK}`,
        },
      }
    );

    const data = response.data.data;

    if (data.status === "success") {
      const orderIds = data.metadata.allOrders || [];

      // ✅ Mark orders as paid
      await orderModel.updateMany(
        { _id: { $in: orderIds } },
        { $set: { isPaid: true, status: "Success" } }
      );

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        reference: data.reference,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed or not completed",
      });
    }
  } catch (error) {
    console.error(
      "Paystack verification error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Payment verification failed",
      details: error.response?.data || error.message,
    });
  }
};

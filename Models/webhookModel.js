const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    customerEmail: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: {
      type: String,
      required: true,
      enum: ["NGN"], // ✅ Only NGN for now
      default: "NGN",
    },
    reference: { type: String, required: true, unique: true }, // Unique Paystack reference
    status: { type: String, required: true },
    paidAt: { type: Date, required: true },
    authorizationCode: { type: String, required: true },
    paymentMethod: { type: String, required: true, default: "Paystack" },
    channel: { type: String, required: true, default: "unknown" },
    transactionDate: { type: Date, default: Date.now },
    metadata: { type: Object, default: {} }, // Store additional info like userId, cart items
  },
  { timestamps: true }
);

// Index for faster lookup by reference
paymentSchema.index({ reference: 1 });

const PaymentDB = mongoose.model("paystackpayment", paymentSchema);

module.exports = { PaymentDB };

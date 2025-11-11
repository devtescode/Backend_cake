const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    customerEmail: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: {
      type: String,
      required: true,
      enum: ["NGN", "GBP"], // ✅ Restrict allowed currencies
      default: "NGN",
    },
    reference: { type: String, required: true, unique: true },
    status: { type: String, required: true },
    paidAt: { type: Date, required: true },
    authorizationCode: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    channel: { type: String, required: true },
    transactionDate: { type: Date, default: Date.now },
    metadata: { type: Object }, // ✅ Store extra info like userId, cart items, etc.
  },
  { timestamps: true }
);

const PaymentDB = mongoose.model("paystackpayment", paymentSchema);

module.exports = { PaymentDB };

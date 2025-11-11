const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    customerEmail: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, enum: ["NGN"], default: "NGN" },
    reference: { type: String, required: true, unique: true },
    status: { type: String, required: true },
    paidAt: { type: Date, required: true },
    authorizationCode: { type: String, required: true },
    paymentMethod: { type: String, required: true, default: "Paystack" },
    channel: { type: String, required: true, default: "unknown" },
    fees: { type: Number, default: 0 },
    feesBreakdown: { type: Object, default: {} }, // Paystack fees_breakdown object
    authorizationDetails: { type: Object, default: {} }, // full authorization object
    customerDetails: { type: Object, default: {} }, // customer object
    metadata: { type: Object, default: {} },
    transactionDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// paymentSchema.index({ reference: 1 });

const PaymentDB = mongoose.model("paystackpayment", paymentSchema);

module.exports = { PaymentDB };

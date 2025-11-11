const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const { PaymentDB } = require("../Models/webhookModel");
const { Userschema } = require("../Models/user.models");
require("dotenv").config();

const PAYSTACK_SECRET_KEY = process.env.API_SECRET_PAYSTACK;

router.post("/cakewebhook", express.raw({ type: "application/json" }), async (req, res) => {
    console.log("🔔 Cake webhook triggered");

    try {
        const signature = req.headers["x-paystack-signature"];
        const rawBody = req.body;

        if (!signature || !rawBody) return res.status(400).json({ error: "Missing signature or raw body" });

        // Ensure rawBody is string for HMAC
        const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY)
            .update(rawBody.toString())
            .digest("hex");

        if (hash !== signature) return res.status(403).json({ error: "Invalid signature" });

        const event = JSON.parse(rawBody.toString("utf8"));
        console.log("✅ Paystack Webhook Event:", event.event);

        if (event.event === "charge.success") {
            const data = event.data || {};

            const email = data.customer?.email || data.metadata?.email;
            const authorization_code = data.authorization?.authorization_code || "N/A";

            if (!data.amount || !email) return res.status(400).json({ error: "Missing amount or email" });

            const amountInNGN = data.amount / 100;

            // Prevent duplicate
            const existingPayment = await PaymentDB.findOne({ reference: data.reference });
            if (existingPayment) return res.status(200).json({ message: "Duplicate payment ignored" });

            // Save payment record
            const payment = new PaymentDB({
                event: event.event,
                customerEmail: email,
                amount: amountInNGN,
                currency: "NGN",
                reference: data.reference,
                status: data.status,
                paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
                authorizationCode: authorization_code,
                paymentMethod: "Paystack",
                channel: data.channel || "unknown",
                fees: data.fees / 100 || 0,
                feesBreakdown: data.fees_breakdown || {},
                authorizationDetails: data.authorization || {},
                customerDetails: data.customer || {},
                metadata: data.metadata || {},
            });

            await payment.save();
            console.log(`💰 Payment saved: ${data.reference} (NGN ${amountInNGN})`);

            // Update user balance
            const user = await Userschema.findOne({ email });
            if (user) {
                if (!user.Balance) user.Balance = {};
                if (!user.Balance["NGN"]) user.Balance["NGN"] = 0;

                user.Balance["NGN"] += amountInNGN;
                await user.save();

                console.log(`✅ NGN balance updated for ${user.fullname}: +${amountInNGN}`);
            }
        }

        return res.status(200).json({ message: "Webhook processed successfully" });
    } catch (error) {
        console.error("🔥 Webhook error:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;

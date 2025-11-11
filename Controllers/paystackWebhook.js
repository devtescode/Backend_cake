const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const { PaymentDB } = require("../Models/webhookModel");
const { Userschema } = require("../Models/user.models");
require("dotenv").config();

const PAYSTACK_SECRET_KEY = process.env.API_SECRET_PAYSTACK;



router.post("/cakewebhook", express.raw({ type: "application/json" }), async (req, res) => {
    console.log("my Cakeswebhooks");

    try {
        const signature = req.headers["x-paystack-signature"];
        const rawBody = req.body;

        if (!PAYSTACK_SECRET_KEY) {
            console.error("❌ Paystack secret key is missing! Check your .env file.");
            process.exit(1);
        }

        if (!signature || !rawBody) {
            console.error("❌ Missing signature or raw body");
            return res.status(400).json({ error: "Missing signature or raw body" });
        }

        // ✅ Verify Paystack signature
        const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY)
            .update(rawBody)
            .digest("hex");

        if (hash !== signature) {
            console.error("❌ Invalid Paystack signature");
            return res.status(403).json({ error: "Invalid signature" });
        }

        // Parse webhook event
        const event = JSON.parse(rawBody.toString("utf8"));
        console.log("✅ Paystack Webhook Event:", event.event);

        if (event.event === "charge.success") {
            const {
                amount,
                status,
                paidAt,
                authorization,
                channel,
                reference,
                metadata,
                customer,
            } = event.data || {};

            const email = customer?.email || metadata?.email;
            const authorization_code = authorization?.authorization_code || "N/A";

            if (!amount || !email) {
                console.error("❌ Missing required payment data");
                return res.status(400).json({ error: "Missing amount or email" });
            }

            const amountInNGN = amount / 100; // Convert kobo to Naira
            const currencyCode = "NGN"; // Force NGN only

            // ✅ Prevent duplicate payment entries
            const existingPayment = await PaymentDB.findOne({ reference });
            if (existingPayment) {
                console.warn("⚠️ Duplicate payment reference ignored:", reference);
                return res.status(200).json({ message: "Duplicate payment ignored" });
            }

            // ✅ Save payment record
            const payment = new PaymentDB({
                event: event.event,
                customerEmail: email,
                amount: amountInNGN,
                currency: currencyCode,
                reference,
                status,
                paidAt: paidAt ? new Date(paidAt) : new Date(),
                authorizationCode: authorization_code,
                paymentMethod: "Paystack",
                channel: channel || "unknown",
                metadata: metadata || {},
            });

            await payment.save();
            console.log(`💰 Payment saved: ${reference} (${currencyCode} ${amountInNGN})`);

            // ✅ Update user balance
            const user = await Userschema.findOne({ email });
            if (user) {
                if (!user.Balance) user.Balance = {};
                if (!user.Balance[currencyCode]) user.Balance[currencyCode] = 0;

                user.Balance[currencyCode] += amountInNGN;
                await user.save();

                console.log(`✅ ${currencyCode} balance updated for ${user.fullname}: +${amountInNGN}`);
            } else {
                console.warn(`⚠️ No user found for email: ${email}`);
            }
        }

        return res.status(200).json({ message: "Webhook processed successfully" });
    } catch (error) {
        console.error("🔥 Webhook error:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;

const express = require("express");
const upload = require("../config/multer");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const Plan = require("../Models/plan.models"); 

const router = express.Router();

router.post("/admincreateplan", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const imageUrl = await uploadToCloudinary(req.file.path, "plans");

    const newPlan = new Plan({
      ...req.body,
      image: imageUrl,
    });

    await newPlan.save();

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      plan: newPlan
    });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create plan",
    });
  }
});

module.exports = router;

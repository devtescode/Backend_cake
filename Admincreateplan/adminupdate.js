const fs = require("fs");
const planModels = require("../Models/plan.models");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const upload = require("../config/multer");

// We wrap multer inside the route setup in admin.js
module.exports.adminupdate = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the plan
    const plan = await planModels.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    // Keep existing image
    let imageUrl = plan.image;

    // If a new image was uploaded, upload to Cloudinary
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path, "plans");

      // Delete local file after uploading
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    }

    // Update fields
    plan.name = req.body.name || plan.name;
    plan.price = req.body.price || plan.price;
    plan.category = req.body.category || plan.category;
    plan.description = req.body.description || plan.description;
    plan.image = imageUrl;

    // Save updated plan
    await plan.save();

    res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      plan,
    });

    console.log("✅ Updated plan:", plan);
  } catch (error) {
    console.error("❌ Error updating plan:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update plan",
    });
  }
};

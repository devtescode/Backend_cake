const { Userschema } = require("../Models/user.models");
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Ensure the upload folder exists
const uploadDir = path.join(__dirname, "../uploads/profileImages");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage (temporary local storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Controller for updating profile
const updateprofile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { address, bio } = req.body;

    const updateData = {};
    if (address) updateData.address = address;
    if (bio) updateData.bio = bio;

    if (req.file) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profileImages",
        use_filename: true,
        unique_filename: false,
      });
      updateData.profileImage = result.secure_url;

      // Delete local file after upload
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting local file:", err);
      });
    }

    const updatedUser = await Userschema.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, select: "-password" }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Profile updated successfully",
      profile: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateprofile, upload };

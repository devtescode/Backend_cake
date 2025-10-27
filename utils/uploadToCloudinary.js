const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder || "uploads", // change folder name as needed
    });

    // remove file from server after uploading to cloudinary
    fs.unlinkSync(filePath);

    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    throw err;
  }
};

module.exports = uploadToCloudinary;

const { Userschema } = require("../Models/user.models")
const jwt = require("jsonwebtoken")
const env = require("dotenv")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const { default: axios } = require("axios")
const orderModel = require("../Models/order.model")
const ADMIN_SECRET_KEY = process.env.JWT_SECRET_KEY
const cloudinary = require('cloudinary').v2;
env.config()


module.exports.userWelcome = (req, res) => {
  res.send('welcome here my user Cake')
  console.log("welcome to my cake");
}

// register controller
module.exports.register = async (req, res) => {
  try {
    const { fullname, email, phonenumber, password } = req.body;

    const existingEmail = await Userschema.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const existingFullname = await Userschema.findOne({ fullname });
    if (existingFullname) {
      return res.status(400).json({ message: "Fullname already in use" });
    }

    const newUser = new Userschema({
      fullname,
      email,
      phonenumber,
      password, 
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
    console.log("✅ User created:", newUser);
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await Userschema.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ✅ Update user activity
    user.isActive = true;
    user.lastActiveAt = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        phonenumber: user.phonenumber,
        isActive: user.isActive,
        lastActiveAt: user.lastActiveAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};


module.exports.logout = async (req, res) => {
  try {
    const { userId } = req.body; // or req.params.userId

    const user = await Userschema.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

module.exports.updatequantity = async (req, res) => {
   try {
    const { quantity } = req.body;
    const { id } = req.params;

    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    // Find and update order
    const updatedOrder = await orderModel.findByIdAndUpdate(
      id,
      { quantity },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Quantity updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({ message: "Server error while updating quantity" });
  }
}


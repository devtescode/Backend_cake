const { Userschema } = require("../Models/user.models")
const jwt = require("jsonwebtoken")
const env = require("dotenv")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const { default: axios } = require("axios")
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

    // check if email & password provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // find user
    const user = await Userschema.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    

    // success response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        phonenumber: user.phonenumber,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};
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

module.exports.register = async (req, res) => {
  try {
    const { fullname, email, phonenumber, password } = req.body;

    // Check if user already exists
    const existingUser = await Userschema.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword, "hashedPassword");
    
    // Create new user
    const newUser = new Userschema({
      fullname,
      email,
      phonenumber,
      password: hashedPassword,
    });
    console.log(newUser, "newUser");
    

    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
    console.log("✅ User created:", newUser);
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
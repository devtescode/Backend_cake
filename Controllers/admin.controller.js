// controllers/admin.controller.js
// const Admin = require("../models/admin.model");
const Admin = require("../Models/admin.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY 

// check if admin exists
module.exports.checkAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne();
    res.json({ exists: !!admin }); // true if admin exists
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// create admin
module.exports.createAdmin = async (req, res) => {  
  try {
    const { fullname, email, password } = req.body;

    // check if already exists
    const adminExists = await Admin.findOne();
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      fullname,
      email,
      password: hashedPassword
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// login admin
module.exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Access denied" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Access denied" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      ADMIN_SECRET_KEY ,
      { expiresIn: "1h" }
    );
    res.json({ message: "Login successful", token, admin: { id: admin._id, fullname: admin.fullname, email: admin.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

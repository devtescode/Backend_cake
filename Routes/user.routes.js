const express = require("express")
const { userWelcome, register, login, logout, updatequantity } = require("../Controllers/user.controllers");
const { useraddorder, getuserorders, getallorders, userdeleteorder } = require("../Controllers/user.order");
const router = express.Router()
// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const cloudinary = require('cloudinary').v2;




// cloudinary.config({
//   cloud_name: 'dr7hnm895',
//   api_key: '368551591217955',
//   api_secret: 'DfUAAD3ie9BnUuKO2puTvzTVpSc',
// });


// CLOUD_NAME = dr7hnm895
// API_KEY = 368551591217955
// API_SECRETCLOUD = DfUAAD3ie9BnUuKO2puTvzTVpSc

// Multer + Cloudinary storage
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'uploads', 
//     allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
//   },
// });
// const uploadpic = multer({ storage: storage });

router.get("/user", userWelcome);
router.post("/register", register);
router.post("/login", login);
router.post("/useraddorder", useraddorder)
router.get("/getuserorders/:userId", getuserorders );
router.get("/getallorders", getallorders)
router.delete("/userdeleteorder/:id", userdeleteorder);
router.post("/logout", logout)
router.put("/updatequantity/:id", updatequantity)

module.exports = router
const express = require("express");
const { checkAdmin, createAdmin, adminLogin } = require("../Controllers/admin.controller");
const router = express.Router();

router.get("/check", checkAdmin);
router.post("/create", createAdmin);
router.post("/login", adminLogin);

module.exports = router;

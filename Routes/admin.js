const express = require("express");
const { checkAdmin, createAdmin, adminLogin } = require("../Controllers/admin.controller");
const router = express.Router();

router.get("/check", checkAdmin);
router.post("/create", createAdmin);
router.post("/login", adminLogin);
router.post("/admincreateplan", require("../Admincreateplan/adminplan"));
router.get("/admingetplan", require("../Admincreateplan/admingetplan").admingetplan);
router.delete("/admindelete/:id", require("../Admincreateplan/admindelete").admindelete);
module.exports = router;

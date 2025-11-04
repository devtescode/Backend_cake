const express = require("express");
const { checkAdmin, createAdmin, adminLogin } = require("../Controllers/admin.controller");
const router = express.Router();
const { adminupdate } = require("../Admincreateplan/adminupdate");
const upload = require("../config/multer");

router.get("/check", checkAdmin);
router.post("/create", createAdmin);
router.post("/login", adminLogin);
router.post("/admincreateplan", require("../Admincreateplan/adminplan"));
router.get("/admingetplan", require("../Admincreateplan/admingetplan").admingetplan);
router.delete("/admindelete/:id", require("../Admincreateplan/admindelete").admindelete);
router.get("/getsingleplan/:id", require("../Admincreateplan/getsingleplan").getsingleplan);
router.put("/adminupdate/:id", upload.single("image"), adminupdate);
router.put("/orders/:id/delivered", require("../Admincreateplan/admindelivered").markOrderAsDelivered);
router.get("/settledorders", require("../Admincreateplan/admindelivered").settledorders);
router.put("/deliveredgroup", require("../Admincreateplan/admindelivered").deliveredgroup);





module.exports = router;

const express = require("express");
const { initialize } = require("../Paymentcontrollers/payment");
const router = express.Router();

router.post("/initialize", initialize)




module.exports = router;

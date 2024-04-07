const express = require("express");
const router = express.Router();
const { createBilling } = require("../../controllers/gratis/billing");
const { authCheck } = require("../../middlewares/auth");

router.post("/gratis/create-billing", authCheck, createBilling);

module.exports = router;

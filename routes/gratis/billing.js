const express = require("express");
const router = express.Router();
const {
  getBillings,
  createBilling,
} = require("../../controllers/gratis/billing");
const { authCheck } = require("../../middlewares/auth");

router.get("/gratis/get-billings", authCheck, getBillings);
router.post("/gratis/create-billing", authCheck, createBilling);

module.exports = router;

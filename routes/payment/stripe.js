const express = require("express");
const router = express.Router();
const {
  cretePaymentIntent,
  getCartTotals,
  getSubGrandTotal,
} = require("../../controllers/payment/stripe");
const { authCheck } = require("../../middlewares/auth");

router.post("/create-payment-intent", authCheck, cretePaymentIntent);
router.post("/get-cart-totals", authCheck, getCartTotals);
router.post("/get-subgrand-total", authCheck, getSubGrandTotal);

module.exports = router;

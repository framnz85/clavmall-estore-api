const express = require("express");
const router = express.Router();
const {
  listPayments,
  listMyPayment,
  listMyPayments,
  createPayment,
  updatePayment,
  imageupdate,
  deletePayment,
} = require("../../controllers/payment/payment");
const { authCheck, adminCheck } = require("../../middlewares/auth");

router.get("/payment/payments", listPayments);

router.post("/payment/mypayments", listMyPayments);
router.get("/payment/mypayment/:payid", listMyPayment);
router.post("/payment/mypayment", authCheck, adminCheck, createPayment);
router.put("/payment/mypayment", authCheck, adminCheck, updatePayment);
router.put("/payment/imageupdate/:payid", authCheck, adminCheck, imageupdate);
router.delete(
  "/payment/mypayment/:payid",
  authCheck,
  adminCheck,
  deletePayment
);

module.exports = router;

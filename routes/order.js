const express = require("express");
const router = express.Router();
const {
  order,
  orders,
  createOrder,
  updateOrder,
  updatePayment,
  checkExistCart
} = require("../controllers/order");
const { authCheck } = require("../middlewares/auth");

router.post("/user/order", authCheck, createOrder);
router.post("/user/orders", authCheck, orders);
router.get("/user/order/:orderid", authCheck, order);
router.put("/user/order/:orderid", authCheck, updateOrder);
router.put("/user/orderpayment/:orderid", authCheck, updatePayment);
router.get("/user/check-exist-cart", authCheck, checkExistCart);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  userOrder,
  userOrders,
  adminOrder,
  adminOrders,
  adminDaySale,
  adminDaySaleCapital,
  updateCart,
  saveCartOrder,
  updateOrderStatus,
  deleteAdminOrder,
  deleteOrder,
} = require("../../controllers/gratis/order");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/gratis/user-order/:orderid", authCheck, userOrder);
router.get(
  "/gratis/admin-order/:orderid",
  authCheck,
  adminGratisCheck,
  adminOrder
);
router.post("/gratis/user-orders", authCheck, userOrders);
router.post("/gratis/admin-orders", authCheck, adminGratisCheck, adminOrders);
router.post("/gratis/update-cart", authCheck, updateCart);
router.post("/gratis/save-cart-order", authCheck, saveCartOrder);
router.post(
  "/gratis/admin-day-sale",
  authCheck,
  adminGratisCheck,
  adminDaySale
);
router.post(
  "/gratis/admin-day-sale-capital",
  authCheck,
  adminGratisCheck,
  adminDaySaleCapital
);
router.put(
  "/gratis/update-order-status",
  authCheck,
  adminGratisCheck,
  updateOrderStatus
);
router.delete(
  "/gratis/delete-admin-order/:orderid",
  authCheck,
  adminGratisCheck,
  deleteAdminOrder
);
router.delete("/gratis/delete-order/:orderid", authCheck, deleteOrder);

module.exports = router;

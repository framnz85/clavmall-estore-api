const express = require("express");
const router = express.Router();
const {
  userOrder,
  userOrders,
  adminOrder,
  adminOrders,
  updateCart,
  saveCartOrder,
  updateOrderStatus,
  deleteAdminOrder,
  deleteOrder,
} = require("../../controllers/gratis/order");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/gratis/user-order/:orderid", authCheck, userOrder);
router.get("/gratis/user-orders", authCheck, userOrders);
router.get(
  "/gratis/admin-order/:orderid",
  authCheck,
  adminGratisCheck,
  adminOrder
);
router.get("/gratis/admin-orders", authCheck, adminGratisCheck, adminOrders);
router.post("/gratis/update-cart", authCheck, updateCart);
router.post("/gratis/save-cart-order", authCheck, saveCartOrder);
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

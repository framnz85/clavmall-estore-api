const express = require("express");
const router = express.Router();
const {
  listUsers,
  userCart,
  getUserCart,
  emptyCart,
  saveAddress,
  createOrder,
  applyCouponToUserCart,
  orders,
  order,
  addToWishlist,
  wishlist,
  removeFromWishlist,
  updateProfile,
} = require("../controllers/user");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.get("/admin/users", authCheck, adminCheck, listUsers);

router.post("/user/cart", authCheck, userCart);
router.get("/user/cart/:coucode/:addiv3Id", authCheck, getUserCart);
router.delete("/user/cart", authCheck, emptyCart);
router.post("/user/address", authCheck, saveAddress);

router.post("/user/order", authCheck, createOrder);
router.post("/user/orders", authCheck, orders);
router.get("/user/order/:orderid", authCheck, order);

router.post("/user/cart/coupon", authCheck, applyCouponToUserCart);

router.post("/user/wishlist", authCheck, addToWishlist);
router.get("/user/wishlist", authCheck, wishlist);
router.put("/user/wishlist/:productId", authCheck, removeFromWishlist);

router.put("/user/profile", authCheck, updateProfile);

module.exports = router;

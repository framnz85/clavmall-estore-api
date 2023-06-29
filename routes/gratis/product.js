const express = require("express");
const router = express.Router();
const {
  randomItems,
  singleItems,
  getAdminItems,
  addProduct,
  updateProduct,
} = require("../../controllers/gratis/product");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/gratis/products/random/:count", randomItems);
router.get("/gratis/get-product/:slug", singleItems);
router.post(
  "/gratis/get-admin-products",
  authCheck,
  adminGratisCheck,
  getAdminItems
);
router.post("/gratis/add-product", authCheck, adminGratisCheck, addProduct);
router.put(
  "/gratis/update-product/:prodid",
  authCheck,
  adminGratisCheck,
  updateProduct
);

module.exports = router;

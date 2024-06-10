const express = require("express");
const router = express.Router();
const { getProducts, getProduct } = require("../../controllers/app/product");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/app/all-products", authCheck, adminGratisCheck, getProducts);
router.get(
  "/app/get-product-details/:prodid",
  authCheck,
  adminGratisCheck,
  getProduct
);

module.exports = router;

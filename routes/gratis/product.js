const express = require("express");
const router = express.Router();
const {
  randomItems,
  singleItems,
  loadInitProducts,
  getAdminItems,
  addProduct,
  searchProduct,
  updateProduct,
  deleteProduct,
} = require("../../controllers/gratis/product");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/gratis/products/random/:count", randomItems);
router.get("/gratis/get-product/:slug", singleItems);
router.get(
  "/gratis/init-product",
  authCheck,
  adminGratisCheck,
  loadInitProducts
);
router.post(
  "/gratis/get-admin-products",
  authCheck,
  adminGratisCheck,
  getAdminItems
);
router.post("/gratis/add-product", authCheck, adminGratisCheck, addProduct);
router.post("/gratis/search-product", searchProduct);
router.put(
  "/gratis/update-product/:prodid",
  authCheck,
  adminGratisCheck,
  updateProduct
);
router.delete(
  "/gratis/delete-product/:prodid",
  authCheck,
  adminGratisCheck,
  deleteProduct
);

module.exports = router;

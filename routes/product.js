const express = require("express");
const router = express.Router();
const {
  create,
  remove,
  read,
  update,
  imageupdate,
  list,
  random,
  productStar,
  listRelated,
  listOtherVariant,
  searchFilters,
  bulkChangePrice,
  bulkDeleteProduct,
  bulkStatusProduct
} = require("../controllers/product");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/product", authCheck, adminCheck, create);

router.get("/product/:slug", read);
router.put("/product/:slug", authCheck, adminCheck, update);
router.delete("/product/:slug", authCheck, adminCheck, remove);

router.put("/product/imageupdate/:slug", authCheck, adminCheck, imageupdate);

router.post("/products", list);
router.post("/products/random/:count", random);

router.put("/product/star/:productId", authCheck, productStar);

router.get("/product/related/:productId", listRelated);
router.get("/product/parent/:productId", listOtherVariant);

router.post("/search/filters/:count", searchFilters);

router.put("/product/changeprice/bulk", authCheck, adminCheck, bulkChangePrice);
router.put("/product/deleteproduct/bulk", authCheck, adminCheck, bulkDeleteProduct);
router.put("/product/statusproduct/bulk", authCheck, adminCheck, bulkStatusProduct);

module.exports = router;

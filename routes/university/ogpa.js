const express = require("express");
const router = express.Router();
const {
  getOgpa,
  getOgpaEmail,
  existOgpa,
  newOgpa,
  manyChat,
  manyChatPurchase,
  getProducts,
  getProduct,
  updateProduct,
  updateProducts,
} = require("../../controllers/university/ogpa");

router.get("/ogpa", getOgpa);
router.get("/ogpa-email/:email", getOgpaEmail);
router.get("/ogpa-password/:email/:password", existOgpa);
router.post("/ogpa/new", newOgpa);

router.get("/manychat/:mcid/:flowns", manyChat);
router.get("/manychat-purchase/:mcid/:email", manyChatPurchase);

router.get("/pmd-products", getProducts);
router.get("/pmd-product/:prodid", getProduct);
router.put("/pmd-product/:prodid", updateProduct);
router.put("/pmd-products", updateProducts);

module.exports = router;

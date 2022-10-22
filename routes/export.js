const express = require("express");
const router = express.Router();
const { allproducts, importProducts } = require("../controllers/export");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.get("/export-all-products", authCheck, adminCheck, allproducts);
router.put("/import-products", authCheck, adminCheck, importProducts);

module.exports = router;
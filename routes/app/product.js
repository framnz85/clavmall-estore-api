const express = require("express");
const router = express.Router();
const { getProducts } = require("../../controllers/app/product");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/app/all-products", authCheck, adminGratisCheck, getProducts);

module.exports = router;

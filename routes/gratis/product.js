const express = require("express");
const router = express.Router();
const { randomItems } = require("../../controllers/gratis/product");
const { authCheck, adminCheck } = require("../../middlewares/auth");

router.post("/gratis/products/random/:count", randomItems);

module.exports = router;

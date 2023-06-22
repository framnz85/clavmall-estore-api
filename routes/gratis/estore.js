const express = require("express");
const router = express.Router();
const { getEstore } = require("../../controllers/gratis/estore");

router.get("/gratis/estore/:slug", getEstore);

module.exports = router;

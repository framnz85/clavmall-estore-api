const express = require("express");
const router = express.Router();
const {
  getProvinces,
  getMuncities,
} = require("../../controllers/prime/location");

router.get("/prime/get-provinces", getProvinces);
router.get("/prime/get-muncities/:prov", getMuncities);

module.exports = router;

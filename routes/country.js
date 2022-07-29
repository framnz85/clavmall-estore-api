const express = require("express");
const router = express.Router();
const { listCountry, listMyCountry } = require("../controllers/country");

router.get("/address/country", listCountry);
router.get("/address/mycountry", listMyCountry);

module.exports = router;

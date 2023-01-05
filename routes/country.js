const express = require("express");
const router = express.Router();
const { listCountry, listMyCountry, estoreCountries } = require("../controllers/country");

router.get("/address/country", listCountry);
router.get("/address/mycountry", listMyCountry);
router.get("/address/estoreCountries/:estoreid", estoreCountries);

module.exports = router;

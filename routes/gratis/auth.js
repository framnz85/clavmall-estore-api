const express = require("express");
const router = express.Router();
const { loginUser, getCountries } = require("../../controllers/gratis/auth");

router.post("/gratis/auth-login", loginUser);
router.get("/gratis/get-countries", getCountries);

module.exports = router;

const express = require("express");
const router = express.Router();
const { loginUser } = require("../../controllers/gratis/auth");

router.post("/gratis/auth-login", loginUser);

module.exports = router;

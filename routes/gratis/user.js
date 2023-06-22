const express = require("express");
const router = express.Router();
const { getUserDetails } = require("../../controllers/gratis/user");
const { authCheck } = require("../../middlewares/auth");

router.get("/gratis/user-details", authCheck, getUserDetails);

module.exports = router;

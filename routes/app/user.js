const express = require("express");
const router = express.Router();
const { getUsers } = require("../../controllers/app/user");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/app/all-users", authCheck, adminGratisCheck, getUsers);

module.exports = router;

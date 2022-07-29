const express = require("express");
const router = express.Router();
const { createOrUpdateUser, currentUser, updateEmailAddress } = require("../controllers/auth");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/create-or-update-user", authCheck, createOrUpdateUser);
router.post("/current-user", authCheck, currentUser);
router.post("/current-admin", authCheck, adminCheck, currentUser);

router.put("/update-email-address", authCheck, updateEmailAddress);

module.exports = router;

const express = require("express");
const router = express.Router();
const { referrallist, referralorders } = require("../controllers/referral");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/referral-list", authCheck, referrallist);
router.post("/referral-orders", authCheck, referralorders);

module.exports = router;
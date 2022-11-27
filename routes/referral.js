const express = require("express");
const router = express.Router();
const {
    commissionlist,
    referrallist,
    referralorders,
    referralCreate,
    allCommissionlist,
    editCommissionStatus,
    referralWithdraw,
    allWithdrawallist
} = require("../controllers/referral");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/commission-list", authCheck, commissionlist);
router.post("/referral-list", authCheck, referrallist);
router.post("/referral-orders", authCheck, referralorders);

router.post("/referral-create", authCheck, adminCheck, referralCreate);
router.post("/all-commission-list", authCheck, adminCheck, allCommissionlist);
router.put("/update-commission-status", authCheck, adminCheck, editCommissionStatus);
router.post("/referral-withdraw", authCheck, referralWithdraw);
router.post("/all-withdrawal-list", authCheck, adminCheck, allWithdrawallist);

module.exports = router;
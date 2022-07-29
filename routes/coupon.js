const express = require("express");
const router = express.Router();
const { create, remove, list, update } = require("../controllers/coupon");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/coupon", authCheck, adminCheck, create);
router.get("/coupons", list);
router.delete("/coupon/:couponId", authCheck, adminCheck, remove);
router.put("/coupon-activate/:couponId", authCheck, adminCheck, update);

module.exports = router;

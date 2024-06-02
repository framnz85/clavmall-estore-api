const express = require("express");
const router = express.Router();
const { getPosOrders } = require("../../controllers/app/order");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/app/all-pos-orders", authCheck, adminGratisCheck, getPosOrders);

module.exports = router;

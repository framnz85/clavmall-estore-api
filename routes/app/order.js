const express = require("express");
const router = express.Router();
const { getPosOrders, saveOrder } = require("../../controllers/app/order");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/app/all-pos-orders", authCheck, adminGratisCheck, getPosOrders);
router.post("/app/save-pos-orders", authCheck, adminGratisCheck, saveOrder);

module.exports = router;

const express = require("express");
const router = express.Router();
const { orders, order, orderStatus, checkImageUser } = require("../controllers/admin");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/admin/orders", authCheck, adminCheck, orders);
router.get("/admin/order/:orderid", authCheck, adminCheck, order);
router.put("/admin/order-status", authCheck, adminCheck, orderStatus);
router.get("/admin/check-image-user/:publicid", authCheck, adminCheck, checkImageUser);

module.exports = router;

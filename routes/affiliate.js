const express = require("express");
const router = express.Router();
const { list, create } = require("../controllers/affiliate");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/affiliate-list", list);
router.post("/affiliate-withdraw", authCheck, adminCheck, create);

module.exports = router;
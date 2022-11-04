const express = require("express");
const router = express.Router();
const { list, prospectList, create, update } = require("../controllers/affiliate");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/affiliate-list", list);
router.post("/affiliate-prospects", prospectList);
router.post("/affiliate-withdraw", authCheck, adminCheck, create);
router.put("/affiliate-withdraw", authCheck, adminCheck, update);

module.exports = router;
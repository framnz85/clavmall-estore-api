const express = require("express");
const router = express.Router();
const { listAddiv2, listMyAddiv2 } = require("../controllers/addiv2");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.get("/address/addiv2/:couid/:addiv1", listAddiv2);
router.get("/address/myaddiv2/:couid/:addiv1", listMyAddiv2);

module.exports = router;

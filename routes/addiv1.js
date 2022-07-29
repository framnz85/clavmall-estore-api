const express = require("express");
const router = express.Router();
const { listAddiv1, listMyAddiv1 } = require("../controllers/addiv1");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.get("/address/addiv1/:couid", listAddiv1);
router.get("/address/myaddiv1/:couid", listMyAddiv1);

module.exports = router;

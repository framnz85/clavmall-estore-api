const express = require("express");
const router = express.Router();
const { listAddiv1, listMyAddiv1, estoreAddiv1s } = require("../controllers/addiv1");

router.get("/address/addiv1/:couid", listAddiv1);
router.get("/address/myaddiv1/:couid", listMyAddiv1);
router.get("/address/estoreAddiv1s/:estoreid/:couid", estoreAddiv1s);

module.exports = router;

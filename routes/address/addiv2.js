const express = require("express");
const router = express.Router();
const {
  listAddiv2,
  listMyAddiv2,
  estoreAddiv2s,
} = require("../../controllers/address/addiv2");

router.get("/address/addiv2/:couid/:addiv1", listAddiv2);
router.get("/address/myaddiv2/:couid/:addiv1", listMyAddiv2);
router.get("/address/estoreAddiv2s/:estoreid/:couid", estoreAddiv2s);

module.exports = router;

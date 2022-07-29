const express = require("express");
const router = express.Router();
const {
  read,
  listNewAdded,
  listAddiv3,
  listMyAddiv3,
  updateMyAddiv3,
} = require("../controllers/addiv3");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.get("/address/locate/:addiv3", read);

router.get("/address/myaddiv3", authCheck, adminCheck, listNewAdded);

router.get("/address/addiv3/:couid/:addiv1/:addiv2", listAddiv3);
router.get("/address/myaddiv3/:couid/:addiv1/:addiv2", listMyAddiv3);

router.put(
  "/address/updatemyaddiv3/:addiv3",
  authCheck,
  adminCheck,
  updateMyAddiv3
);

module.exports = router;

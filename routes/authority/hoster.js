const express = require("express");
const router = express.Router();
const {
  updateAffiliate,
  updateWithdrawal,
  updateOgpa,
} = require("../../controllers/authority/hoster");

router.put("/estore/estore/:affid", updateAffiliate);
router.put("/withdraw/withdrawal/:withid", updateWithdrawal);
router.put("/ogt/ogpa/:ogpaid", updateOgpa);

module.exports = router;

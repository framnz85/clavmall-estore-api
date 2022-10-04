const express = require("express");
const router = express.Router();
const { getOgpa, getOgpaEmail, existOgpa, newOgpa, manyChat, manyChatPurchase } = require("../controllers/ogpa");

router.get("/ogpa", getOgpa);
router.get("/ogpa-email/:email", getOgpaEmail);
router.get("/ogpa-password/:email/:password", existOgpa);
router.post("/ogpa/new", newOgpa);

router.get("/manychat/:mcid/:flowns", manyChat);
router.get("/manychat-purchase/:mcid/:email", manyChatPurchase);

module.exports = router;

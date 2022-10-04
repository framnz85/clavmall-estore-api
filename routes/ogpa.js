const express = require("express");
const router = express.Router();
const { getOgpa, getOgpaEmail, existOgpa, newOgpa } = require("../controllers/ogpa");

router.get("/ogpa", getOgpa);
router.get("/ogpa/:email", getOgpaEmail);
router.get("/ogpa/:email/:password", existOgpa);
router.post("/ogpa/new", newOgpa);

module.exports = router;

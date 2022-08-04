const express = require("express");
const router = express.Router();
const { getOgpa, existOgpa, newOgpa } = require("../controllers/ogpa");

router.get("/ogpa", getOgpa);
router.get("/ogpa/:email", existOgpa);
router.post("/ogpa/new", newOgpa);

module.exports = router;

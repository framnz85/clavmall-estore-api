const express = require("express");
const router = express.Router();
const { getOgpa, newOgpa } = require("../controllers/ogpa");

router.get("/ogpa", getOgpa);
router.post("/ogpa/new", newOgpa);

module.exports = router;

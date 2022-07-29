const express = require("express");
const router = express.Router();
const { getUser, createOrUpdateUser } = require("../controllers/ogt");

router.get("/ogt/:email", getUser);
router.post("/ogt", createOrUpdateUser);

module.exports = router;

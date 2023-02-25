const express = require("express");
const router = express.Router();
const { getUser, getOgpas, createOrUpdateUser } = require("../controllers/ogt");

router.get("/ogt/:email/:password", getUser);
router.get("/ogt/:userid", getOgpas);
router.post("/ogt", createOrUpdateUser);

module.exports = router;

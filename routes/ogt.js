const express = require("express");
const router = express.Router();
const { getUser, getOgpas, createOrUpdateUser, newOgpa, updateUser } = require("../controllers/ogt");

router.get("/ogt/:email/:password", getUser);
router.get("/ogt/:userid", getOgpas);
router.post("/ogt", createOrUpdateUser);
router.post("/ogt/ogpa-new", newOgpa);
router.post("/ogt/update-user", updateUser);

module.exports = router;

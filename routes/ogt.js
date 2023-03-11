const express = require("express");
const router = express.Router();
const {
    getUser,
    getOgpas,
    getPrograms,
    getProgram,
    createOrUpdateUser,
    newOgpa,
    updateUser
} = require("../controllers/ogt");

router.get("/ogt/:email/:password", getUser);
router.get("/ogt/:userid", getOgpas);
router.get("/program", getPrograms);
router.get("/program/:slug", getProgram);

router.post("/ogt", createOrUpdateUser);
router.post("/ogt/ogpa-new", newOgpa);
router.post("/ogt/update-user", updateUser);

module.exports = router;

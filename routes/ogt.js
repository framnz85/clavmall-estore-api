const express = require("express");
const router = express.Router();
const {
    getUser,
    getOgts,
    getOgpas,
    getPrograms,
    getProgram,
    createOrUpdateUser,
    newOgpa,
    updateUser,
    createEarning,
    getEarnings
} = require("../controllers/ogt");

router.get("/ogt/:email/:password", getUser);
router.get("/ogt-user/:userid", getOgts);
router.get("/ogt/:userid", getOgpas);
router.get("/program", getPrograms);
router.get("/program/:slug", getProgram);
router.get("/ogt-earning/:userid", getEarnings);

router.post("/ogt", createOrUpdateUser);
router.post("/ogt/ogpa-new", newOgpa);
router.post("/ogt/update-user", updateUser);
router.post("/ogt/earning", createEarning);

module.exports = router;

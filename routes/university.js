const express = require("express");
const router = express.Router();
const {
    getUser,
    getUserByToken,
    getReferrals,
    createUser,
    updateUser,
    recoverPassword,
    changePassword,
    updateUsersMcid,
} = require("../controllers/university/user");
const {
    getDashboard,
    getEarnings,
    addEarning,
} = require("../controllers/university/earning");
const {
    getPromote,
    getProgram,
    getPrograms,
    getMyPrograms,
    updateProgram
} = require("../controllers/university/pogram");
const {
    generateAuthToken,
    uniRegAuthCheck,
    uniLogAuthCheck
} = require("../middlewares/universityAuth");

router.get("/university/generate-token/:email/:password", generateAuthToken);

router.get("/university/login-user", uniLogAuthCheck, getUser);
router.get("/university/get-user", uniLogAuthCheck, getUserByToken);
router.get("/university/program/:slug", getProgram);
router.get("/university/program", getPrograms);
router.get("/university/dashboard/:userid", getDashboard);
router.get("/university/myprogram", uniLogAuthCheck, getMyPrograms);

router.get("/faculty/promote", getPromote);

router.post("/university/add-user", uniRegAuthCheck, createUser);
router.post("/university/earnings", uniLogAuthCheck, getEarnings);
router.post("/university/referrals", uniLogAuthCheck, getReferrals);
router.post("/university/add-earning", uniLogAuthCheck, addEarning);

router.put("/university/update-user", uniLogAuthCheck, updateUser);
router.put("/university/recover-password", recoverPassword);
router.put("/university/change-password", uniLogAuthCheck, changePassword);
router.put("/university/update-user-mcid", updateUsersMcid);
router.put("/university/update-program/:progid", uniLogAuthCheck, updateProgram);

module.exports = router;

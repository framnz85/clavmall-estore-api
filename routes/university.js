const express = require("express");
const router = express.Router();
const {
    getUser,
    getUserById,
    getProgram,
    getPrograms,
    createOrUpdateUser,
    updateUser,
    updatePassword,
    getDashboard,
    getEarnings,
    getReferrals,
    updateUsersMcid,
    getMyPrograms,
    updateProgram
} = require("../controllers/university");

router.get("/university/user/:email/:password", getUser);
router.get("/university/id-user/:userid", getUserById);
router.get("/university/program/:slug", getProgram);
router.get("/university/program", getPrograms);
router.get("/university/dashboard/:userid", getDashboard);
router.get("/university/myprogram/:userid", getMyPrograms);

router.post("/university/add-user", createOrUpdateUser);
router.post("/university/earnings/:userid", getEarnings);
router.post("/university/referrals/:userid", getReferrals);

router.put("/university/update-user", updateUser);
router.put("/university/update-password", updatePassword);
router.put("/university/update-user-mcid", updateUsersMcid);
router.put("/university/update-program/:progid", updateProgram);

module.exports = router;

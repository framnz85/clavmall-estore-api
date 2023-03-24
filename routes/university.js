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
    getEarnings,
    updateUsersMcid,
    getMyPrograms,
    updateProgram
} = require("../controllers/university");

router.get("/university/user/:email/:password", getUser);
router.get("/university/id-user/:userid", getUserById);
router.get("/university/program/:slug", getProgram);
router.get("/university/program", getPrograms);
router.get("/university/earning/:userid", getEarnings);
router.get("/university/myprogram/:userid", getMyPrograms);

router.post("/university/add-user", createOrUpdateUser);

router.put("/university/update-user", updateUser);
router.put("/university/update-password", updatePassword);
router.put("/university/update-user-mcid", updateUsersMcid);
router.put("/university/update-program/:progid", updateProgram);

module.exports = router;

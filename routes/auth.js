const express = require("express");
const router = express.Router();
const {
    createOrUpdateUser,
    currentUser,
    updateRole,
    removeUser,
    updateEmailAddress,
    generateAuthToken,
    existUserAuthToken,
    loginAsAuthToken
} = require("../controllers/auth");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/create-or-update-user", authCheck, createOrUpdateUser);
router.post("/current-user", authCheck, currentUser);
router.put("/user-updaterole", authCheck, adminCheck, updateRole);
router.delete("/user-delete/:userid", authCheck, adminCheck, removeUser);
router.post("/current-user", authCheck, currentUser);
router.post("/current-admin", authCheck, adminCheck, currentUser);

router.put("/update-email-address", authCheck, updateEmailAddress);

router.post("/generate-authtoken", generateAuthToken);
router.post("/existuser-authtoken", existUserAuthToken);
router.post("/loginas-authtoken", authCheck, adminCheck, loginAsAuthToken);
router.post("/loginas-authtoken", authCheck, adminCheck, loginAsAuthToken);

module.exports = router;

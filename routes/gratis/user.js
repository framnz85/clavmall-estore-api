const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserDetails,
  createNewUser,
  updateUser,
  verifyUserEmail,
  changePassword,
  forgotPassword,
  deleteUser,
  sendEmail,
  userEndPoint,
} = require("../../controllers/gratis/user");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/gratis/all-users", authCheck, adminGratisCheck, getAllUsers);
router.get("/gratis/user-details", authCheck, getUserDetails);
router.post("/gratis/user-create", createNewUser);
router.post("/gratis/user-email", sendEmail);
router.put("/gratis/user-update", authCheck, updateUser);
router.put("/gratis/user-verify", authCheck, verifyUserEmail);
router.put("/gratis/change-password", authCheck, changePassword);
router.put("/gratis/forgot-password", forgotPassword);
router.put("/gratis/user-endpoint", authCheck, userEndPoint);
router.delete(
  "/gratis/user-delete/:userid",
  authCheck,
  adminGratisCheck,
  deleteUser
);

module.exports = router;

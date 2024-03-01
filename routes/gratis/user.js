const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserDetails,
  getRaffleEntries,
  getTopEntries,
  createNewUser,
  updateUser,
  verifyUserEmail,
  changePassword,
  resetPassword,
  forgotPassword,
  deleteUser,
  deleteAllRaffles,
  sendEmail,
} = require("../../controllers/gratis/user");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/gratis/all-users", authCheck, adminGratisCheck, getAllUsers);
router.get("/gratis/user-details", authCheck, getUserDetails);
router.get("/gratis/raffle-entries", authCheck, getRaffleEntries);
router.get(
  "/gratis/top-entries/:count",
  authCheck,
  adminGratisCheck,
  getTopEntries
);
router.post("/gratis/user-create", createNewUser);
router.post("/gratis/user-email", sendEmail);
router.put("/gratis/user-update", authCheck, updateUser);
router.put("/gratis/user-verify", authCheck, verifyUserEmail);
router.put("/gratis/change-password", authCheck, changePassword);
router.put(
  "/gratis/reset-password/:userid",
  authCheck,
  adminGratisCheck,
  resetPassword
);
router.put("/gratis/forgot-password", forgotPassword);
router.delete(
  "/gratis/user-delete/:userid",
  authCheck,
  adminGratisCheck,
  deleteUser
);
router.delete(
  "/gratis/delete-all-raffles",
  authCheck,
  adminGratisCheck,
  deleteAllRaffles
);

module.exports = router;

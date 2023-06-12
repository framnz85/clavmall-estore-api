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
  getProgram,
  getPrograms,
  getMyPrograms,
  createProgram,
  updateProgram,
  updateSalesPage,
  getProgramSales,
  copySalesTemp,
} = require("../controllers/university/program");
const {
  generateAuthToken,
  uniRegAuthCheck,
  uniLogAuthCheck,
} = require("../middlewares/universityAuth");
const { getPromote } = require("../controllers/university/promote");
const {
  getLoginRewards,
  checkLoginToday,
  createLoginReward,
} = require("../controllers/university/loginreward");
const {
  getPostRewards,
  checkPostToday,
  createPostReward,
} = require("../controllers/university/postreward");

router.get("/university/generate-token/:email/:password", generateAuthToken);

router.get("/university/login-user", uniLogAuthCheck, getUser);
router.get("/university/get-user", uniLogAuthCheck, getUserByToken);
router.get("/university/program/:slug", getProgram);
router.get("/university/program-sales/:progid", getProgramSales);
router.get("/university/program", getPrograms);
router.get("/university/dashboard/:userid", getDashboard);
router.get("/university/myprogram", uniLogAuthCheck, getMyPrograms);

router.get("/university/check-login-today", uniLogAuthCheck, checkLoginToday);

router.get("/university/check-post-today", uniLogAuthCheck, checkPostToday);

router.post("/university/add-user", uniRegAuthCheck, createUser);
router.post("/university/earnings", uniLogAuthCheck, getEarnings);
router.post("/university/referrals", uniLogAuthCheck, getReferrals);
router.post("/university/add-earning", uniLogAuthCheck, addEarning);

router.post("/university/promote", getPromote);

router.post(
  "/university/create-login-reward",
  uniLogAuthCheck,
  createLoginReward
);
router.post("/university/login-rewards", uniLogAuthCheck, getLoginRewards);

router.post(
  "/university/create-post-reward",
  uniLogAuthCheck,
  createPostReward
);
router.post("/university/post-rewards", uniLogAuthCheck, getPostRewards);
router.post("/university/create-program", uniLogAuthCheck, createProgram);

router.put("/university/update-user", uniLogAuthCheck, updateUser);
router.put("/university/recover-password", recoverPassword);
router.put("/university/change-password", uniLogAuthCheck, changePassword);
router.put("/university/update-user-mcid", updateUsersMcid);
router.put(
  "/university/update-program/:progid",
  uniLogAuthCheck,
  updateProgram
);
router.put(
  "/university/update-sales/:progid",
  uniLogAuthCheck,
  updateSalesPage
);
router.put(
  "/university/update-copysales/:saleid/:progid",
  uniLogAuthCheck,
  copySalesTemp
);

module.exports = router;

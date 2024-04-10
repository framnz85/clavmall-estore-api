const express = require("express");
const router = express.Router();
const {
  getCategory,
  getCategories,
  addCategory,
  updateCategory,
  removeCategory,
} = require("../../controllers/gratis/category");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/gratis/get-category/:catid", authCheck, getCategory);
router.get("/gratis/get-categories", getCategories);
router.post("/gratis/add-category", authCheck, adminGratisCheck, addCategory);
router.put(
  "/gratis/update-category/:catid",
  authCheck,
  adminGratisCheck,
  updateCategory
);
router.delete(
  "/gratis/remove-category/:catid",
  authCheck,
  adminGratisCheck,
  removeCategory
);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getCategory,
  getCategories,
  getAdminCategories,
  addCategory,
  updateCategory,
  removeCategory,
} = require("../../controllers/gratis/category");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/gratis/get-category/:slug", authCheck, getCategory);
router.get("/gratis/get-categories", getCategories);
router.get(
  "/gratis/get-admin-categories",
  authCheck,
  adminGratisCheck,
  getAdminCategories
);
router.post("/gratis/add-category", authCheck, adminGratisCheck, addCategory);
router.put(
  "/gratis/update-category/:slug",
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

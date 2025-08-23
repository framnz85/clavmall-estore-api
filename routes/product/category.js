const express = require("express");
const router = express.Router();
const {
  create,
  update,
  remove,
  list,
  getSubcats,
  getParents,
  getProducts,
  imageupdate,
} = require("../../controllers/product/category");
const { authCheck, adminCheck } = require("../../middlewares/auth");

router.post("/category", authCheck, adminCheck, create);
router.post("/categories", list);
router.put("/category/:slug", authCheck, adminCheck, update);
router.put("/category/imageupdate/:slug", authCheck, adminCheck, imageupdate);
router.delete("/category/:slug", authCheck, adminCheck, remove);

router.get("/category/subcats/:_id", getSubcats);
router.get("/category/parents/:_id", getParents);
router.post("/categories/product/:catid", getProducts);

module.exports = router;

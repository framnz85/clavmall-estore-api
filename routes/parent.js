const express = require("express");
const router = express.Router();
const {
  create,
  update,
  remove,
  list,
  listsWithCatids,
  getProducts,
} = require("../controllers/parent");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/parent", authCheck, adminCheck, create);
router.get("/parents/:count", list);
router.post("/parents-with-catids", listsWithCatids);
router.put("/parent/:parSlug/:slug", authCheck, adminCheck, update);
router.delete("/parent/:parent/:slug", authCheck, adminCheck, remove);

router.post("/parent/products/:parid", getProducts);

module.exports = router;

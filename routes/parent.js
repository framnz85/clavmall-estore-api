const express = require("express");
const router = express.Router();
const {
  create,
  update,
  remove,
  list,
  getProducts,
} = require("../controllers/parent");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/parent", authCheck, adminCheck, create);
router.get("/parents/:count", list);
router.put("/parent/:slug", authCheck, adminCheck, update);
router.delete("/parent/:slug", authCheck, adminCheck, remove);

router.post("/parent/products/:parid", getProducts);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  create,
  update,
  remove,
  listsWithCatids,
  lists,
  getProducts,
} = require("../controllers/subcat");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/subcat", authCheck, adminCheck, create);
router.get("/subcats/:count", lists);
router.post("/subcats-with-catids", listsWithCatids);
router.put("/subcat/:slug", authCheck, adminCheck, update);
router.delete("/subcat/:slug", authCheck, adminCheck, remove);

router.post("/subcat/products/:subid", getProducts);

module.exports = router;

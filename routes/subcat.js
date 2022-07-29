const express = require("express");
const router = express.Router();
const {
  create,
  update,
  remove,
  list,
  getProducts,
} = require("../controllers/subcat");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/subcat", authCheck, adminCheck, create);
router.get("/subcats/:count", list);
router.put("/subcat/:slug", authCheck, adminCheck, update);
router.delete("/subcat/:slug", authCheck, adminCheck, remove);

router.post("/subcat/products/:subid", getProducts);

module.exports = router;

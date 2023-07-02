const express = require("express");
const router = express.Router();
const {
  getEstore,
  getEstoreCounters,
  updateEstore,
  createEstore,
} = require("../../controllers/gratis/estore");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/gratis/estore/:slug", getEstore);
router.get("/gratis/estore-counters/:estoreid", getEstoreCounters);
router.post("/gratis/estore-update", authCheck, adminGratisCheck, updateEstore);
router.post("/gratis/estore-create", createEstore);

module.exports = router;

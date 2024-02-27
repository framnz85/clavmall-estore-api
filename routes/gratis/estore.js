const express = require("express");
const router = express.Router();
const {
  getEstore,
  getEstoreCounters,
  updateEstore,
  createEstore,
  checkCosmic,
  approveCosmic,
} = require("../../controllers/gratis/estore");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/gratis/estore/:slug", getEstore);
router.get("/gratis/estore-counters/:estoreid", getEstoreCounters);
router.post("/gratis/estore-update", authCheck, adminGratisCheck, updateEstore);
router.post("/gratis/estore-create", createEstore);
router.post("/gratis/check-cosmic", checkCosmic);
router.put("/gratis/approve-cosmic", approveCosmic);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getEstore,
  getReseller,
  getEstores,
  getEstoreCounters,
  updateEstore,
  createEstore,
  approveCosmic,
  updateEstoreReseller,
} = require("../../controllers/gratis/estore");
const { authCheck, adminGratisCheck } = require("../../middlewares/auth");

router.get("/gratis/estore/:slug", getEstore);
router.get("/gratis/reseller/:id", getReseller);
router.post("/gratis/estores", authCheck, adminGratisCheck, getEstores);
router.get("/gratis/estore-counters/:estoreid", getEstoreCounters);
router.post("/gratis/estore-update", authCheck, adminGratisCheck, updateEstore);
router.post("/gratis/estore-create/:resellid", createEstore);
router.put(
  "/gratis/approve-cosmic",
  authCheck,
  adminGratisCheck,
  approveCosmic
);
router.put(
  "/gratis/update-estore-reseller",
  authCheck,
  adminGratisCheck,
  updateEstoreReseller
);

module.exports = router;

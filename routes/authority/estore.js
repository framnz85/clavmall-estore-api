const express = require("express");
const router = express.Router();
const {
  listCarousel,
  listAll,
  listChanges,
  update,
  estoreupdate,
  updatechanges,
  copyAllAddiv1,
  saveCreatedLocation1,
  copyAllAddiv2,
  saveCreatedLocation2,
  copyAllAddiv3,
  saveCreatedLocation3,
  saveLocation3,
  deleteAddiv3,
  deleteAddiv2,
  deleteAddiv1,
} = require("../../controllers/authority/estore");
const { authCheck, adminCheck } = require("../../middlewares/auth");

router.get("/setting/information/:estid", listCarousel);
router.get("/setting/estore/:estid", authCheck, adminCheck, listAll);
router.get("/setting/changes/:estid", listChanges);
router.put("/setting/carousel/:estid", authCheck, adminCheck, update);
router.put("/setting/estoreupdate/:estid", authCheck, adminCheck, estoreupdate);
router.put(
  "/setting/updatechanges/:estid",
  authCheck,
  adminCheck,
  updatechanges
);

router.put("/setting/copyalladdiv1", authCheck, adminCheck, copyAllAddiv1);
router.put(
  "/setting/savecreatedlocation1",
  authCheck,
  adminCheck,
  saveCreatedLocation1
);
router.put("/setting/copyalladdiv2", authCheck, adminCheck, copyAllAddiv2);
router.put(
  "/setting/savecreatedlocation2",
  authCheck,
  adminCheck,
  saveCreatedLocation2
);
router.put("/setting/copyalladdiv3", authCheck, adminCheck, copyAllAddiv3);
router.put(
  "/setting/savecreatedlocation3",
  authCheck,
  adminCheck,
  saveCreatedLocation3
);
router.put("/setting/savelocation3", authCheck, adminCheck, saveLocation3);

router.delete("/setting/deleteaddiv3", authCheck, adminCheck, deleteAddiv3);
router.delete("/setting/deleteaddiv2", authCheck, adminCheck, deleteAddiv2);
router.delete("/setting/deleteaddiv1", authCheck, adminCheck, deleteAddiv1);

module.exports = router;

const express = require("express");
const router = express.Router();
const { getSchedule } = require("../../controllers/prime/schedule");

router.get("/prime/get-schedule/:schedType", getSchedule);

module.exports = router;

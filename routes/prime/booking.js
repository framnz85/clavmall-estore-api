const express = require("express");
const router = express.Router();
const { addBooking } = require("../../controllers/prime/booking");

router.post("/prime/add-booking", addBooking);

module.exports = router;

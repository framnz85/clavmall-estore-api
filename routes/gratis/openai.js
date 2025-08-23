const express = require("express");
const router = express.Router();
const { getGroceyResponse } = require("../../controllers/chat/openaiGratis");

router.post("/gratis/chat/grocey-response", getGroceyResponse);

module.exports = router;

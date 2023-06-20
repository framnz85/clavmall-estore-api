const express = require("express");
const router = express.Router();
const { getGroceyResonse } = require("../../controllers/chat/openai");

router.post("/chat/grocey-response", getGroceyResonse);

module.exports = router;

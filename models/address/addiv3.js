const mongoose = require("mongoose");
const conn = require("../../dbconnect/address");

const addiv3Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  couid: {
    type: Object,
    required: true,
  },
  adDivId1: {
    type: Object,
    required: true,
  },
  adDivId2: {
    type: Object,
    required: true,
  },
});

const Addiv3 = (coucode) => {
  return conn.model(coucode + "addiv3", addiv3Schema);
};

exports.Addiv3 = Addiv3;

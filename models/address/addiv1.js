const mongoose = require("mongoose");
const conn = require("../../dbconnect/address");

const addiv1Schema = new mongoose.Schema({
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
});

const Addiv1 = (coucode) => {
  return conn.model(coucode + "addiv1", addiv1Schema);
};

exports.Addiv1 = Addiv1;

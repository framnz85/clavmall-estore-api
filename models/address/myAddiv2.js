const mongoose = require("mongoose");
const conn = require("../../dbconnect/estore");

const myAddiv2Schema = new mongoose.Schema({
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
});

myAddiv2Schema.index({ name: "text" });

const MyAddiv2 = (coucode, estoreid) => {
  return conn[estoreid].model(coucode + "myaddiv2", myAddiv2Schema);
};

exports.MyAddiv2 = MyAddiv2;

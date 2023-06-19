const mongoose = require("mongoose");
const conn = require("../../dbconnect/estore");

const myAddiv1Schema = new mongoose.Schema({
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

myAddiv1Schema.index({ name: "text" });

const MyAddiv1 = (coucode, estoreid) => {
  return conn[estoreid].model(coucode + "myaddiv1", myAddiv1Schema);
};

exports.MyAddiv1 = MyAddiv1;

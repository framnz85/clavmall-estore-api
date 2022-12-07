const mongoose = require("mongoose");
const conn = require("../../dbconnect/estore");

const myAddiv3Schema = new mongoose.Schema({
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
  minorder: String,
  maxorder: String,
  delfee: String,
  delfeetype: String,
  discount: String,
  discounttype: String,
  servefee: String,
  servefeetype: String,
  referral: String,
  referraltype: String,
  deltime: String,
  deltimetype: String,
});

const MyAddiv3 = (coucode, estoreid) => {
  return conn[estoreid].model(coucode + "myaddiv3", myAddiv3Schema);
};

exports.MyAddiv3 = MyAddiv3;

const mongoose = require("mongoose");
const conn = require("../../dbconnect/estore");

const myCountrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  countryCode: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 3,
  },
  currency: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 3,
  },
  adDivName1: {
    type: String,
    minlength: 2,
    maxlength: 255,
  },
  adDivName2: {
    type: String,
    minlength: 2,
    maxlength: 255,
  },
  adDivName3: {
    type: String,
    minlength: 2,
    maxlength: 255,
  },
});

const MyCountry = (estoreid) => {
  return conn[estoreid].model("MyCountry", myCountrySchema);
};

module.exports = MyCountry;

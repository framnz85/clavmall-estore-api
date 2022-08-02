const mongoose = require("mongoose");
const conn = require("../dbconnect/ogt");

const ogpaSchema = new mongoose.Schema(
  {
    amount: String,
    name: {
      type: String,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      index: true,
    },
    password: String,
    mobile: String,
    payment: String,
    payDetails: String
  },
  { timestamps: true }
);

module.exports = conn.model("Ogpa", ogpaSchema);

const mongoose = require("mongoose");
const conn = require("../dbconnect/ogt");

const ogpadetSchema = new mongoose.Schema(
  {
    amount: String,
  },
  { timestamps: true }
);

module.exports = conn.model("Ogpadet", ogpadetSchema);

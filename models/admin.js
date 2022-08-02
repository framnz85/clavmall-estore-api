const mongoose = require("mongoose");
const conn = require("../dbconnect/admin");

const ogpaSchema = new mongoose.Schema(
  {
    amount: String,
  },
  { timestamps: true }
);

module.exports = conn.model("Ogpa", ogpaSchema);

const mongoose = require("mongoose");
const conn = require("../dbconnect/ogt");

const programSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    commission1: String,
    commission2: String,
    commission3: String,
  },
  { timestamps: true }
);

module.exports = conn.model("Program", programSchema);

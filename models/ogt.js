const mongoose = require("mongoose");
const conn = require("../dbconnect/ogt");

const ogtSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = conn.model("Ogt", ogtSchema);

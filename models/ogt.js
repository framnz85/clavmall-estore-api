const mongoose = require("mongoose");
const conn = require("../dbconnect/ogt");
const { ObjectId } = mongoose.Schema;

const ogtSchema = new mongoose.Schema(
  {
    refid: ObjectId,
    name: String,
    email: {
      type: String,
      required: true,
      index: true,
    },
    password: String,
  },
  { timestamps: true }
);

module.exports = conn.model("Ogt", ogtSchema);

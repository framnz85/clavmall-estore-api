const mongoose = require("mongoose");
const conn = require("../../dbconnect/university");

const facultySchema = new mongoose.Schema(
  {
    multiLogin: Number
  },
  { timestamps: true }
);

module.exports = conn.model("Faculty", facultySchema);
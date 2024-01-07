const mongoose = require("mongoose");
const conn = require("../../dbconnect/prime");

const provinceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Province = conn.model("Province", provinceSchema);

module.exports = Province;

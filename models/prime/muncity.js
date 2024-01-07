const mongoose = require("mongoose");
const conn = require("../../dbconnect/prime");

const muncitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    booked: {
      type: Number,
    },
    earliestBooked: {
      type: String,
    },
    province: {
      type: String,
    },
  },
  { timestamps: true }
);

const Muncity = conn.model("Muncity", muncitySchema);

module.exports = Muncity;

const mongoose = require("mongoose");
const conn = require("../../dbconnect/prime");

const bookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    muncity: {
      type: String,
    },
    incomeGoal: {
      type: String,
    },
    investment: {
      type: String,
    },
    month: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Booking = conn.model("Booking", bookingSchema);

module.exports = Booking;

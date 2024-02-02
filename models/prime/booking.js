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
    province: {
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
    hasStore: {
      type: Boolean,
    },
    isSupermarket: {
      type: Boolean,
    },
    schedType: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Booking = conn.model("Booking", bookingSchema);

module.exports = Booking;

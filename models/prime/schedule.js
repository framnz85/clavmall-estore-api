const mongoose = require("mongoose");
const conn = require("../../dbconnect/prime");

const scheduleSchema = new mongoose.Schema(
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

const Schedule = conn.model("Schedule", scheduleSchema);

module.exports = Schedule;

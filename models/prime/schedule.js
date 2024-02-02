const mongoose = require("mongoose");
const conn = require("../../dbconnect/prime");

const scheduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    schedType: {
      type: Number,
    },
    src: {
      type: String,
    },
  },
  { timestamps: true }
);

const Schedule = conn.model("Schedule", scheduleSchema);

module.exports = Schedule;

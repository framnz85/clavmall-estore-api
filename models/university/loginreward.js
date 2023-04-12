const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../../dbconnect/university");

const loginrewardSchema = new mongoose.Schema(
  {
    owner: {
      type: ObjectId,
      ref: "User",
    },
    rewardDate: String,
    amount: Number,
    commission: Number,
    status: Boolean,
  },
  { timestamps: true }
);

module.exports = conn.model("Loginreward", loginrewardSchema);
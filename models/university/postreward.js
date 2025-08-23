const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../../dbconnect/university");

const postrewardSchema = new mongoose.Schema(
  {
    owner: {
      type: ObjectId,
      ref: "User",
    },
    rewardDate: String,
    postLink: String,
    amount: Number,
    commission: Number,
    status: Boolean,
  },
  { timestamps: true }
);

module.exports = conn.model("Postreward", postrewardSchema);
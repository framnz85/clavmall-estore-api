const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../../dbconnect/university");

const earningSchema = new mongoose.Schema(
  {
    owner: {
      type: ObjectId,
      ref: "User",
    },
    customer: {
      type: ObjectId,
      ref: "User",
    },
    product: {
      type: ObjectId,
      ref: "Program",
    },
    productName: String,
    amount: Number,
    commission: Number,
    status: Boolean,
  },
  { timestamps: true }
);

module.exports = conn.model("Earning", earningSchema);
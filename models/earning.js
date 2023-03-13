const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../dbconnect/ogt");

const earningSchema = new mongoose.Schema(
  {
    owner: {
      type: ObjectId,
      ref: "Ogt",
    },
    customer: {
      type: ObjectId,
      ref: "Ogt",
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
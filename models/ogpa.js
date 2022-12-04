const mongoose = require("mongoose");
const conn = require("../dbconnect/ogt");
const { ObjectId } = mongoose.Schema;

const ogpaSchema = new mongoose.Schema(
  {
    amount: String,
    name: {
      type: String,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      index: true,
    },
    refid: ObjectId,
    password: String,
    mobile: String,
    payment: String,
    payDetails: String,
    dateStart: Date,
    md5pass: String,
    status: {
      type: String,
      default: "pending",
      enum: [
        "pending",
        "paid",
        "active",
      ],
    },
  },
  { timestamps: true }
);

module.exports = conn.model("Ogpa", ogpaSchema);

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../dbconnect/allusers");

const withdrawalSchema = new mongoose.Schema(
  {
    estoreid: ObjectId,
    affid: ObjectId,
    userid: ObjectId,
    name: {
      type: String,
      required: true,
    },
    product: {
      type: String,
      required: true,
    },
    amount: Number,
    commission: Number,
    status: {
      type: String,
      default: "Pending",
      enum: [
        "Pending",
        "Approved",
      ],
    },
  },
  { timestamps: true }
);

module.exports = conn.model("Withdrawal", withdrawalSchema);
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../dbconnect/estore");

const referralSchema = new mongoose.Schema(
  {
    ownerid: ObjectId,
    ownername: String,
    orderid: ObjectId,
    orderCode: String,
    userid: ObjectId,
    username: String,
    amount: Number,
    commission: Number,
    bank: String,
    accountNumber: String,
    accountName: String,
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

const Referral = (estoreid) => {
  return conn[estoreid].model("Referral", referralSchema);
};

module.exports = Referral;
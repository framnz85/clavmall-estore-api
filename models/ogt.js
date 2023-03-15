const mongoose = require("mongoose");
const conn = require("../dbconnect/ogt");
const { ObjectId } = mongoose.Schema;

const ogtSchema = new mongoose.Schema(
  {
    refid: ObjectId,
    name: String,
    email: {
      type: String,
      required: true,
      index: true,
    },
    password: String,
    recovery: String,
    confirmed: Boolean,
    mcid: String,
    premium: Number,
    billingHistory: [
      {
        productName: String,
        totalPrice: String,
        payment: String,
        payStatus: String,
        duration: Number,
        subscriptionID: String,
        domainName: String,
      },
    ],
    programList: [
      {
        progid: {
          type: ObjectId,
          ref: "Program"
        },
        amount: Number,
        payment: String,
        status: Boolean,
        steps: Number,
      }
    ]
  },
  { timestamps: true }
);

module.exports = conn.model("Ogt", ogtSchema);

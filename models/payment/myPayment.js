const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../../dbconnect/estore");

const myPaymentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    category: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
      enum: [
        "Credit/Debit Card",
        "Bank Transfer",
        "Online Banking",
        "Remittance",
        "Online Payment",
        "Cash on Delivery",
        "Cryptocurrency",
      ],
    },
    details: [{ desc: String, value: String }],
    noAvail: [
      {
        couid: { type: ObjectId },
        country: String,
        addiv1: { type: ObjectId },
        addiv1Name: String,
        addiv2: { type: ObjectId },
        addiv2Name: String,
        addiv3: { type: ObjectId },
        addiv3Name: String,
      },
    ],
  },
  { timestamps: true }
);

const MyPayment = (estoreid) => {
  return conn[estoreid].model("MyPayment", myPaymentSchema);
};

module.exports = MyPayment;

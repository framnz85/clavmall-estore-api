const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../dbconnect/estore");

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      index: true,
    },
    products: [
      {
        product: {
          type: ObjectId,
          ref: "Product",
        },
        price: Number,
        count: Number,
        variant: ObjectId,
      },
    ],
    paymentOption: {
      payid: ObjectId,
      category: {
        type: String,
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
      name: String,
    },
    orderStatus: {
      type: String,
      default: "Not Processed",
      enum: [
        "Not Processed",
        "Waiting Payment",
        "Processing",
        "Delivering",
        "Cancelled",
        "Completed",
      ],
    },
    cartTotal: Number,
    delfee: Number,
    discount: Number,
    servefee: Number,
    grandTotal: Number,
    orderedBy: { type: ObjectId, ref: "User" },
    history: [
      {
        historyDate: {
          type: Date,
          default: Date.now
        },
        historyDesc: String,
        historyMess: String,
      }
    ]
  },
  { timestamps: true }
);

const Order = (estoreid) => {
  return conn[estoreid].model("Order", orderSchema);
};

module.exports = Order;

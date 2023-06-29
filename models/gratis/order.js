const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../../dbconnect/gratis");

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
          ref: "GratisProduct",
        },
        price: Number,
        count: Number,
        variant: ObjectId,
      },
    ],
    paymentOption: {
      type: ObjectId,
      ref: "GratisPayment",
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
    grandTotal: Number,
    orderedBy: { type: ObjectId, ref: "GratisUser" },
    estoreid: ObjectId,
    delAddress: String,
  },
  { timestamps: true }
);

orderSchema.index({ orderCode: "text" });

const Order = conn.model("GratisOrder", orderSchema);

module.exports = Order;

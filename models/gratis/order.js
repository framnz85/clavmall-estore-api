const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../../dbconnect/gratis");

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      index: true,
    },
    orderType: {
      type: String,
      default: "web",
      enum: ["web", "pos"],
    },
    products: [
      {
        product: {
          type: ObjectId,
          ref: "GratisProduct",
        },
        supplierPrice: Number,
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
    discount: Number,
    addDiscount: Number,
    grandTotal: Number,
    cash: Number,
    orderedBy: { type: ObjectId, ref: "GratisUser" },
    orderedName: String,
    estoreid: ObjectId,
    delAddress: String,
    orderNotes: String,
  },
  { timestamps: true }
);

orderSchema.index({ orderCode: "text" });

const Order = conn.model("GratisOrder", orderSchema);

module.exports = Order;

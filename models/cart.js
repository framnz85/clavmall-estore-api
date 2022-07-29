const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../dbconnect/estore");

const cartSchema = new mongoose.Schema(
  {
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
    cartTotal: Number,
    delfee: Number,
    discount: Number,
    servefee: Number,
    grandTotal: Number,
    orderedBy: { type: ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Cart = (estoreid) => {
  return conn[estoreid].model("Cart", cartSchema);
};

module.exports = Cart;

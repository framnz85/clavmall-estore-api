const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../dbconnect/estore");

const userSchema = new mongoose.Schema(
  {
    name: String,
    phone: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    picture: String,
    role: {
      type: String,
      default: "customer",
      enum: [
        "admin",
        "moderator",
        "customer",
      ],
    },
    cart: {
      type: Array,
      default: [],
    },
    address: {
      details: String,
      country: {},
      addiv1: {},
      addiv2: {},
      addiv3: {},
    },
    homeAddress: {
      details: String,
      country: {},
      addiv1: {},
      addiv2: {},
      addiv3: {},
    },
    wishlist: [{ type: ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

const User = (estoreid) => {
  return conn[estoreid].model("User", userSchema);
};

module.exports = User;

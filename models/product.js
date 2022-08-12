const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../dbconnect/estore");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 128,
      text: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: 2000,
      text: true,
    },
    supplierPrice: {
      type: Number,
      trim: true,
      maxlength: 32,
    },
    markup: {
      type: Number,
      trim: true,
      maxlength: 32,
    },
    markuptype: String,
    price: {
      type: Number,
      required: true,
      trim: true,
      maxlength: 32,
    },
    category: {
      type: ObjectId,
      ref: "Category",
    },
    subcats: [
      {
        type: ObjectId,
        ref: "Subcat",
      },
    ],
    parent: {
      type: ObjectId,
      ref: "Parent",
    },
    quantity: Number,
    sold: {
      type: Number,
      default: 0,
    },
    variants: [
      {
        name: String,
        quantity: Number,
        sold: {
          type: Number,
          default: 0,
        },
      },
    ],
    images: {
      type: Array,
    },
    ratings: [
      {
        star: Number,
        postedBy: { type: ObjectId, ref: "User" },
      },
    ],
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
    activate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = (estoreid) => {
  return conn[estoreid].model("Product", productSchema);
};

module.exports = Product;

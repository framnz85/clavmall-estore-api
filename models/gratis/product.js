const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../../dbconnect/gratis");

const productSchema = new mongoose.Schema(
  {
    estoreid: ObjectId,
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 128,
      text: true,
      index: true,
    },
    slug: {
      type: String,
      lowercase: true,
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
    price: {
      type: Number,
      required: true,
      trim: true,
      maxlength: 32,
    },
    category: {
      type: ObjectId,
      ref: "GratisCategory",
    },
    quantity: Number,
    sold: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
    },
    activate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

productSchema.index({ title: "text" });

const Product = conn.model("GratisProduct", productSchema);

module.exports = Product;

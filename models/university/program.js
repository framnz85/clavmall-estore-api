const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../../dbconnect/university");

const programSchema = new mongoose.Schema(
  {
    title: String,
    owner: {
      type: ObjectId,
      ref: "User"
    },
    description: String,
    commission1: String,
    commission2: String,
    commission3: String,
    image1: String,
    currency: {
      type: String,
      default: "USD",
      enum: [
        "USD",
        "PHP",
      ],
    },
    price: String,
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    subtitle: String,
    discountPrice: String,
    saleSlug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    salesPage: String,
  },
  { timestamps: true }
);

module.exports = conn.model("Program", programSchema);

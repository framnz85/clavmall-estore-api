const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../dbconnect/allusers");
const Country = require("./address/country");

const estoreSchema = new mongoose.Schema(
  {
    name: String,
    carouselImages: {
      type: Array,
    },
    country: {
      type: ObjectId,
      ref: Country,
      required: true,
    },
    adDivId1: {
      type: ObjectId,
      required: true,
    },
    adDivId2: {
      type: ObjectId,
      required: true,
    },
    adDivId3: {
      type: ObjectId,
      required: true,
    },
    address: String,
    textCarousel: [
      {
        name: { type: String },
      }
    ],
    showHomeCarousel: Boolean,
    showRandomItems: Boolean,
    showCategories: Boolean,
    showNewArrival: Boolean,
    showBestSeller: Boolean,
    headerColor: String,
    carouselColor: String,
    categoryChange: {
      type: Number,
      default: 0,
    },
    subcatChange: {
      type: Number,
      default: 0,
    },
    parentChange: {
      type: Number,
      default: 0,
    },
    productChange: {
      type: Number,
      default: 0,
    },
    locationChange: {
      type: Number,
      default: 0,
    },
    estoreChange: {
      type: Number,
      default: 0,
    },
    imageStorage: {
      type: String,
      enum: [
        "clavmall",
        "cloudinary"
      ],
    },
  },
  { timestamps: true }
);

module.exports = conn.model("Estore", estoreSchema);

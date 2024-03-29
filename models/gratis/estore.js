const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../../dbconnect/gratis");
const Country = require("../address/country");

const estoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: String,
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "pause", "stop", "active"],
    },
    country: {
      type: ObjectId,
      ref: Country,
      required: true,
    },
    headerColor: String,
    carouselColor: String,
    paymentChange: {
      type: Number,
      default: 0,
    },
    categoryChange: {
      type: Number,
      default: 0,
    },
    productChange: {
      type: Number,
      default: 0,
    },
    estoreChange: {
      type: Number,
      default: 0,
    },
    invites: {
      type: Number,
      default: 0,
    },
    imageStorage: {
      type: String,
      enum: ["clavmall", "cloudinary"],
    },
    openaiAPI: String,
    delfee: String,
    deltime: String,
    delloc: String,
    productLimit: {
      type: Number,
      default: 50,
    },
    categoryLimit: {
      type: Number,
      default: 10,
    },
    userLimit: {
      type: Number,
      default: 20,
    },
    scannerType: {
      type: String,
      enum: ["webcam", "barScan"],
    },
    billingHistory: [
      {
        upgradeType: String,
        payment: String,
        totalPrice: String,
        payStatus: {
          type: String,
          enum: ["Paid", "Pending"],
        },
        duration: Number,
        referenceId: String,
      },
    ],
    upgradeType: String,
    upStatus: {
      type: String,
      enum: ["Active", "Pending"],
    },
    upEndDate: Date,
    raffleActivation: Boolean,
    raffleTitle: String,
    rafflePrize: String,
    raffleEntryAmount: Number,
    raffleEntryCount: Number,
    unlimitedEntry: Boolean,
    raffleDate: Date,
    raffleHistory: [
      {
        winner: String,
        raffleTitle: String,
        rafflePrize: String,
        raffleDate: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = conn.model("GratisEstore", estoreSchema);

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
    image: Object,
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      default: "active",
      enum: ["pending", "pause", "stop", "active"],
    },
    country: {
      type: ObjectId,
      ref: Country,
      required: true,
    },
    headerColor: { type: String, default: "#009A57" },
    carouselColor: String,
    showRandomItems: {
      type: Boolean,
      default: true,
    },
    showCategories: {
      type: Boolean,
      default: true,
    },
    showBestSeller: {
      type: Boolean,
      default: true,
    },
    showItemsForYou: {
      type: Boolean,
      default: true,
    },
    orderChange: {
      type: Number,
      default: 0,
    },
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
    userChange: {
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
    storeAddress: String,
    storeContact: String,
    delfee: String,
    delfeeType: {
      type: String,
      enum: ["percent", "number"],
      default: "percent",
    },
    deltime: String,
    delloc: String,
    discount: String,
    discountType: {
      type: String,
      enum: ["percent", "number"],
      default: "percent",
    },
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
    recurring1: Number,
    approval: {
      type: String,
      enum: ["Approved", "For Approval", "Pending"],
    },
    upStatus2: {
      type: String,
      enum: ["Active", "Pending"],
    },
    recurring2: Number,
    approval2: {
      type: String,
      enum: ["Approved", "For Approval", "Pending"],
    },
    upStatus3: {
      type: String,
      enum: ["Active", "Pending"],
    },
    recurring3: Number,
    approval3: {
      type: String,
      enum: ["Approved", "For Approval", "Pending"],
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
    resellid: ObjectId,
    reseller: {
      appName: String,
      homeImage: Object,
      pack1Name: String,
      regPrice1: Number,
      pack1Price: Number,
      promoCode1: String,
      monthly1: Number,
      annual1: Number,
      affComm1: Number,
      pack2Name: String,
      regPrice2: Number,
      pack2Price: Number,
      promoCode2: String,
      monthly2: Number,
      annual2: Number,
      affComm2: Number,
      pack3Name: String,
      regPrice3: Number,
      pack3Price: Number,
      promoCode3: String,
      monthly3: Number,
      annual3: Number,
      affComm3: Number,
      domain: String,
      allowGuide: { type: Boolean, default: true },
      trainTitle: String,
      allowTraining: Boolean,
      training: [
        {
          title: String,
          lessons: Array,
        },
      ],
      status: { type: Boolean, default: false },
    },
    accessibility: {
      moderator: {
        type: Array,
        default: [
          "dashboard",
          "category",
          "product",
          "payment",
          "products",
          "raffle",
          "manageuser",
          "insights",
          "setting",
          "guide",
          "training",
          "cartprice",
        ],
      },
      cashier: {
        type: Array,
        default: [
          "dashboard",
          "category",
          "product",
          "payment",
          "products",
          "raffle",
          "manageuser",
          "insights",
          "setting",
          "guide",
          "training",
          "cartprice",
        ],
      },
    },
  },
  { timestamps: true }
);

estoreSchema.index({ name: "text", email: "text" });

const Estore = conn.model("GratisEstore", estoreSchema);

module.exports = Estore;

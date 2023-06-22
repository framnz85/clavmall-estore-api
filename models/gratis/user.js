const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../../dbconnect/gratis");
const Estore = require("../../models/authority/estore");

const userSchema = new mongoose.Schema(
  {
    refid: ObjectId,
    estoreid: {
      type: ObjectId,
      ref: Estore,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    phone: String,
    email: {
      type: String,
      required: true,
      index: true,
    },
    emailConfirm: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    picture: String,
    role: {
      type: String,
      default: "customer",
      enum: ["admin", "moderator", "customer"],
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
    addInstruct: String,
    verifyCode: String,
  },
  { timestamps: true }
);

userSchema.index({ name: "text" });

const User = conn.model("User", userSchema);

module.exports = User;

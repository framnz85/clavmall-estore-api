const mongoose = require("mongoose");
const conn = require("../dbconnect/estore");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: "Name is required",
      minlength: 1,
      maxlength: 256,
    },
    code: {
      type: String,
      trim: true,
      unique: true,
      uppercase: true,
      required: "Code is required",
      minlength: 3,
      maxlength: 64,
    },
    expiry: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    activate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

couponSchema.index({ code: 'text' });

const Coupon = (estoreid) => {
  return conn[estoreid].model("Coupon", couponSchema);
};

module.exports = Coupon;

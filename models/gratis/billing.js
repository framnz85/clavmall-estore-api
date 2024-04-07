const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../../dbconnect/gratis");

const billingSchema = new mongoose.Schema(
  {
    estoreList: Array,
    totalAmount: Number,
    status: {
      type: String,
      enum: ["For Approval", "Approved"],
      default: "For Approval",
    },
    estoreid: ObjectId,
  },
  { timestamps: true }
);

billingSchema.index({ name: "text" });

const Billing = conn.model("GratisBilling", billingSchema);

module.exports = Billing;

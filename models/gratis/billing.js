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
  },
  { timestamps: true }
);

billingSchema.index({ name: "text" });

const Billing = conn.model("GratisBilling", billingSchema);

module.exports = Billing;

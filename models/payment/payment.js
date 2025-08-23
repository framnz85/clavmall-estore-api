const mongoose = require("mongoose");
const conn = require("../../dbconnect/payment");

const paymentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  category: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
    enum: [
      "Credit/Debit Card",
      "Bank Transfer",
      "Online Banking",
      "Remittance",
      "Online Payment",
      "Cash on Delivery",
      "Cryptocurrency",
    ],
  },
});

paymentSchema.index({ name: 'text' });

module.exports = conn.model("Payment", paymentSchema);

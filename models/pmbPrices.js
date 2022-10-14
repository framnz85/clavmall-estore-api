const mongoose = require("mongoose");
const conn = require("../dbconnect/ogt");

const priceSchema = new mongoose.Schema(
  {
    prodid: {
      type: Object,
      required: true,
    },
    adDivId1: {
      type: Object,
      ref: "Addiv1",
      required: true,
    },
    price: Number,
    votes: [
      {
        userid: {
          type: Object,
          ref: "Ogpa",
          required: true,
        },
      }
    ],
  },
  { timestamps: true }
);

module.exports = conn.model("Prices", priceSchema);

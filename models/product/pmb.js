const mongoose = require("mongoose");
const conn = require("../../dbconnect/ogt");
const ObjectId = require("mongoose").Types.ObjectId;

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 128,
      text: true,
    },
    supplierPrice: {
      type: Number,
      trim: true,
      maxlength: 32,
    },
    prices: [
      {
        userid: {
          type: ObjectId,
          ref: "Ogpa",
          required: true,
        },
        amount: Number,
        adDivId1: {
          type: Object,
          ref: "Addiv1",
          required: true,
        },
        adDivName1: String,
      },
    ],
    votes: [
      {
        userid: {
          type: ObjectId,
          ref: "Ogpa",
          required: true,
        },
        priceid: {
          type: ObjectId,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = conn.model("Products", productSchema);

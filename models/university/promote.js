const mongoose = require("mongoose");
const conn = require("../../dbconnect/university");
const { ObjectId } = mongoose.Schema;

const promoteSchema = new mongoose.Schema(
  {
    title: String,
    script: String,
    driveID: String,
    item: Number,
    program: {
      type: ObjectId,
      ref: "Category"
    },
    type: {
      type: String,
      default: "image",
      enum: [
        "image",
        "video",
      ],
    },
  },
  { timestamps: true }
);

module.exports = conn.model("Promote", promoteSchema);
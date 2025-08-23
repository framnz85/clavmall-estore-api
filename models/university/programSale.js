const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../../dbconnect/university");

const programSaleSchema = new mongoose.Schema(
  {
    progid: {
      type: ObjectId,
      ref: "Program",
    },
    owner: {
      type: ObjectId,
      ref: "User",
    },
    title: String,
    salesPagesCount: Number,
  },
  { timestamps: true }
);

module.exports = conn.model("ProgramSale", programSaleSchema);

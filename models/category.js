const mongoose = require("mongoose");
const conn = require("../dbconnect/estore");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      minlength: 2,
      maxlength: 32,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Category = (estoreid) => {
  return conn[estoreid].model("Category", categorySchema);
};

module.exports = Category;

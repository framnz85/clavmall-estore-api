const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../dbconnect/estore");

const subcatSchema = new mongoose.Schema(
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
    parent: { type: ObjectId, ref: "Category", required: true },
  },
  { timestamps: true }
);

subcatSchema.index(
  {
    slug: 1,
    parent: 1,
  },
  {
    unique: true,
  }
);

const Subcat = (estoreid) => {
  return conn[estoreid].model("Subcat", subcatSchema);
};

module.exports = Subcat;

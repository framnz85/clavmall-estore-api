const ObjectId = require("mongoose").Types.ObjectId;
const Product = require("../../models/gratis/product");
const { populateProduct } = require("../authority/common");

exports.randomItems = async (req, res) => {
  const count = req.params.count;
  const estoreid = req.headers.estoreid;

  try {
    let products = await Product.aggregate([
      { $match: { activate: true } },
      { $sample: { size: parseInt(count) } },
    ]).exec();

    products = await populateProduct(products, estoreid);

    res.json(products);
  } catch (error) {
    res.json({ err: "Listing product failed." + error.message });
  }
};

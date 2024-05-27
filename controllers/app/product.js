const ObjectId = require("mongoose").Types.ObjectId;

const Product = require("../../models/gratis/product");

exports.getProducts = async (req, res) => {
  const estoreid = req.headers.estoreid;

  try {
    const products = await Product.find({
      estoreid: ObjectId(estoreid),
    }).exec();

    res.json(products);
  } catch (error) {
    res.json({ err: "Getting all products failed." + error.message });
  }
};

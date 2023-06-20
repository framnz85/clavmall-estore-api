const ObjectId = require("mongoose").Types.ObjectId;
const Product = require("../../models/product/product");

exports.allproducts = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const products = await Product(estoreid)
      .find(
        {},
        " _id title supplierPrice markup markuptype referral referraltype "
      )
      .sort({ title: 1 })
      .exec();

    res.json(products);
  } catch (error) {
    res.status(400).send("Export all products failed");
  }
};

exports.importProducts = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const products = req.body.products;
    for (let i = 0; i < products.length; i++) {
      await Product(estoreid).findOneAndUpdate(
        { _id: ObjectId(products[i]._id) },
        products[i],
        { new: true }
      );
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(400).send("Importing products failed");
  }
};

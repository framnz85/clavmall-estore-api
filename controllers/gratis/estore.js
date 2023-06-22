const ObjectId = require("mongoose").Types.ObjectId;
const Estore = require("../../models/authority/estore");

exports.getEstore = async (req, res) => {
  try {
    const estore = await Estore.findOne({ slug: req.params.slug }).exec();
    res.json(estore);
  } catch (error) {
    res.json({ err: "Fetching store information fails. " + error.message });
  }
};

const ObjectId = require("mongoose").Types.ObjectId;
const slugify = require("slugify");

const Category = require("../../models/gratis/category");
const Estore = require("../../models/gratis/estore");
const Product = require("../../models/gratis/product");

exports.getCategory = async (req, res) => {
  const catid = req.params.catid;
  const estoreid = req.headers.estoreid;
  try {
    const category = await Category.findOne({
      _id: ObjectId(catid),
      estoreid: ObjectId(estoreid),
    });
    res.json(category);
  } catch (error) {
    res.json({ err: "Getting category fails. " + error.message });
  }
};

exports.getCategories = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    let categories = await Category.find({
      estoreid: ObjectId(estoreid),
    }).exec();

    let updatedCategories = [];

    for (let i = 0; i < categories.length; i++) {
      const countProduct = await Product.find({
        category: ObjectId(categories[i]._id),
        estoreid: ObjectId(estoreid),
      }).exec();
      updatedCategories.push({
        ...categories[i]._doc,
        itemcount: countProduct.length,
      });
    }

    res.json(updatedCategories);
  } catch (error) {
    res.json({ err: "Fetching categories fails. " + error.message });
  }
};

exports.addCategory = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const platform = req.headers.platform;
  const name = req.body.name;
  const slug = slugify(req.body.name.toString().toLowerCase());

  try {
    const estore = await Estore.findOne({
      _id: ObjectId(estoreid),
    })
      .select("categoryLimit")
      .exec();

    const categoryCount = await Category.countDocuments({
      estoreid: ObjectId(estoreid),
    }).exec();

    if (categoryCount < estore.categoryLimit || platform === "cosmic") {
      const category = new Category({ name, slug, estoreid });
      await category.save();
      res.json(category);
    } else {
      res.json({
        err: `Sorry, you already added ${estore.categoryLimit} categories on this account. Go to Upgrades to increase your limit.`,
      });
    }
  } catch (error) {
    res.json({ err: "Adding category fails. " + error.message });
  }
};

exports.updateCategory = async (req, res) => {
  const catid = req.params.catid;
  const estoreid = req.headers.estoreid;
  const name = req.body.name;
  const slug = slugify(req.body.name.toString().toLowerCase());
  try {
    const category = await Category.findOneAndUpdate(
      {
        _id: ObjectId(catid),
        estoreid: ObjectId(estoreid),
      },
      { name, slug },
      {
        new: true,
      }
    ).exec();

    const countProduct = await Product.find({
      category: ObjectId(catid),
      estoreid: ObjectId(estoreid),
    }).exec();

    res.json({ ...category._doc, itemcount: countProduct.length });
  } catch (error) {
    res.json({ err: "Updating category fails. " + error.message });
  }
};

exports.removeCategory = async (req, res) => {
  const catid = req.params.catid;
  const estoreid = req.headers.estoreid;
  try {
    const category = await Category.findOneAndDelete({
      _id: ObjectId(catid),
      estoreid: ObjectId(estoreid),
    }).exec();
    res.json(category);
  } catch (error) {
    res.json({ err: "Deleting category fails. " + error.message });
  }
};

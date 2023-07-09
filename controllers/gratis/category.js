const ObjectId = require("mongoose").Types.ObjectId;
const slugify = require("slugify");

const Category = require("../../models/gratis/category");
const Estore = require("../../models/gratis/estore");

exports.getCategory = async (req, res) => {
  const slug = req.params.slug;
  const estoreid = req.headers.estoreid;
  try {
    const category = await Category.findOne({
      slug,
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
    const categories = await Category.find({
      estoreid: ObjectId(estoreid),
    }).exec();
    res.json(categories);
  } catch (error) {
    res.json({ err: "Fetching categories fails. " + error.message });
  }
};

exports.addCategory = async (req, res) => {
  const estoreid = req.headers.estoreid;
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

    if (categoryCount < estore.categoryLimit) {
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
  const reqSlug = req.params.slug;
  const estoreid = req.headers.estoreid;
  const name = req.body.name;
  const slug = slugify(req.body.name.toString().toLowerCase());
  try {
    const category = await Category.findOneAndUpdate(
      {
        slug: reqSlug,
        estoreid: ObjectId(estoreid),
      },
      { name, slug },
      {
        new: true,
      }
    ).exec();
    res.json(category);
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

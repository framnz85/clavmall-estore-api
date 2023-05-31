const ObjectId = require("mongoose").Types.ObjectId;
const slugify = require("slugify");
const Category = require("../models/category");
const Subcat = require("../models/subcat");
const Product = require("../models/product");
const mongoose = require("mongoose");
const { populateProduct } = require("./common");

exports.create = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const { name, parent } = req.body;
    const newSubcat = await Subcat(estoreid).collection.insertOne({
      name, parent: ObjectId(parent), slug: slugify(name.toString().toLowerCase()), createdAt: new Date(), updatedAt: new Date(), __v: 0
    });
    res.json(newSubcat);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send("Sub-category already exist.");
    } else {
      res.status(400).send("Create sub-category failed.");
    }
  }
};

exports.getSubcats = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const maxItem = req.params.count;
    const subcats =
      maxItem > 0
        ? await Subcat(estoreid).aggregate([
            { $sample: { size: parseInt(maxItem) } },
          ]).exec()
        : await Subcat(estoreid).find({}).sort({ name: 1 });

    res.json(subcats);
  } catch (error) {
    res.status(400).send("Something in subcategory failed.");
  }
};

exports.getSubcat = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const slug = req.params.slug;
    const subcat = await Subcat(estoreid).findOne({slug});
    res.json(subcat);
  } catch (error) {
    res.status(400).send("Something in subcategory failed.");
  }
};

exports.listsWithCatids = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const catids = req.body.catids;
    const subcats = await Subcat(estoreid).find({
      parent: { $in: catids }
    }).sort({ name: 1 });

    res.json(subcats);
  } catch (error) {
    res.status(400).send("Something in subcategory failed.");
  }
};

exports.update = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const { name, parent } = req.body;
    const category = await Category(estoreid).findOne({ slug: req.params.parSlug });
    const updated = await Subcat(estoreid).findOneAndUpdate(
      { slug: req.params.slug, parent: ObjectId(category._id) },
      { name, slug: slugify(name.toString().toLowerCase()), parent },
      { new: true }
    );
    if (!updated) {
      res.status(404).send("No sub-category exist under " + req.params.slug);
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(400).send("Delete sub-category failed.");
  }
};

exports.remove = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const subcat = await Subcat(estoreid).findOne({
      parent: ObjectId(req.params.parent),
      slug: req.params.slug
    }).select("_id name");
    const product = await Product(estoreid).find({ 
      subcats: { 
          $elemMatch: { $eq: subcat._id }
      }
    });
    if(product.length > 0){
      res.status(401).send(`${subcat.name} has product/s under it. Remove or unassign all of it first before deleting.`);
      return;
    }
    const deleted = await Subcat(estoreid).findOneAndDelete({ _id: ObjectId(subcat._id) });
    if (!deleted) {
      res.status(404).send(`No sub-category ${subcat.name} exist`);
      return;
    }
    res.json(deleted);
  } catch (error) {
    res.status(400).send("Delete sub-category failed.");
  }
};

exports.getProducts = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const {
    country = {},
    addiv1 = {},
    addiv2 = {},
    addiv3 = {},
  } = req.body.address;
  try {
    let products = await Product(estoreid).aggregate([
      { $match: { activate: true}},
      { $sample: { size: 20 } },
      {
        $match: {
          $and: [
            { subcats: new mongoose.Types.ObjectId(req.params.subid) },
            {
              $nor: [
                {
                  $and: [
                    {
                      "noAvail.couid": ObjectId(country._id),
                    },
                    {
                      "noAvail.addiv1": ObjectId(addiv1._id),
                    },
                    {
                      "noAvail.addiv2": undefined,
                    },
                    {
                      "noAvail.addiv3": undefined,
                    },
                  ],
                },
                {
                  $and: [
                    {
                      "noAvail.couid": ObjectId(country._id),
                    },
                    {
                      "noAvail.addiv1": ObjectId(addiv1._id),
                    },
                    {
                      "noAvail.addiv2": ObjectId(addiv2._id),
                    },
                    {
                      "noAvail.addiv3": undefined,
                    },
                  ],
                },
                {
                  $and: [
                    {
                      "noAvail.couid": ObjectId(country._id),
                    },
                    {
                      "noAvail.addiv1": ObjectId(addiv1._id),
                    },
                    {
                      "noAvail.addiv2": ObjectId(addiv2._id),
                    },
                    {
                      "noAvail.addiv3": ObjectId(addiv3._id),
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ]).exec();

    products = await populateProduct(products, estoreid);

    res.json(products);
  } catch (error) {
    res.status(400).send("Getting sub-category products failed.");
  }
};

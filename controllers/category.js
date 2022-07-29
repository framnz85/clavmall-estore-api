const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const slugify = require("slugify");
const Category = require("../models/category");
const Subcat = require("../models/subcat");
const Parent = require("../models/parent");
const Product = require("../models/product");
const { populateProduct } = require("./common");

exports.create = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const { name } = req.body;
    const newCategory = await Category(estoreid).collection.insertOne({
      name, slug: slugify(name.toString().toLowerCase()), createdAt: new Date(), updatedAt: new Date(), __v: 0
    });
    res.json(newCategory);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send("Category already exist.");
    } else {
      res.status(400).send("Create category failed.");
    }
  }
};

exports.list = async (req, res) => {
  let products = [];
  let categories = [];
  const estoreid = req.headers.estoreid;

  try {
    const {
      country = {},
      addiv1 = {},
      addiv2 = {},
      addiv3 = {},
    } = req.body.address;

    const catResult = await Category(estoreid).find({}).sort({ name: 1 });
    
    for (let i = 0; i < catResult.length; i++) {
      const product = await Product(estoreid).aggregate([
        { $match: { activate: true}},
        { $sample: { size: 50 } },
        {
          $match: {
            $and: [
              { category: catResult[i]._id },
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
      if (product[0]) {
        categories.push(catResult[i]);
        products.push(product[0]);
      };
    }

    products = await populateProduct(products, estoreid);

    res.json({ categories, products, catComplete: catResult });
  } catch (error) {
    res.status(400).send("Something in category failed.");
  }
};

exports.update = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const { name } = req.body;
    const updated = await Category(estoreid).findOneAndUpdate(
      { slug: req.params.slug },
      { name, slug: slugify(name.toString().toLowerCase()) },
      { new: true }
    );
    if (!updated) {
      res.status(404).send("No category exist under " + req.params.slug);
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(400).send("Delete category failed.");
  }
};

exports.remove = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const category = await Category(estoreid).findOne({ slug: req.params.slug }).select("_id name");
    const product = await Product(estoreid).findOne({ category: ObjectId(category._id) });
    if(product){
      res.status(401).send(`${category.name} has product/s under it. Remove or unassign all of it first before deleting.`);
      return;
    }
    const parent = await Parent(estoreid).findOne({ parent: ObjectId(category._id) });
    if(parent){
      res.status(401).send(`${category.name} has parent/s under it. Remove or unassign all of it first before deleting.`);
      return;
    }
    const subcat = await Subcat(estoreid).findOne({ parent: ObjectId(category._id) });
    if(subcat){
      res.status(401).send(`${category.name} has sub-category under it. Remove or unassign all of it first before deleting.`);
      return;
    }
    const deleted = await Category(estoreid).findOneAndDelete({ _id: ObjectId(category._id) });
    if (!deleted) {
      res.status(404).send(`No category ${category.name} exist`);
      return;
    }
    res.json(deleted);
  } catch (error) {
    res.status(400).send("Category delete failed.");
  }
};

exports.getSubcats = async (req, res) => {
  const estoreid = req.headers.estoreid;
  Subcat(estoreid).find({ parent: req.params._id }).exec((error, subcats) => {
    if (error) res.status(400).send("Getting sub-categories failed.");
    res.json(subcats);
  });
};

exports.getParents = async (req, res) => {
  const estoreid = req.headers.estoreid;
  Parent(estoreid).find({ parent: req.params._id }).exec((error, parents) => {
    if (error) res.status(400).send("Getting parents failed.");
    res.json(parents);
  });
};

exports.getProducts = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const {
    country = {},
    addiv1 = {},
    addiv2 = {},
    addiv3 = {},
  } = req.body.address;
  Product(estoreid).aggregate([
    { $match: { activate: true}},
    { $sample: { size: 20 } },
    {
      $match: {
        $and: [
          { category: new mongoose.Types.ObjectId(req.params.catid) },
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
  ]).exec(async (error, result) => {
    if (error) {
      res.status(400).send("Getting products by category failed.");
    } else {
      result = await populateProduct(result, estoreid);

      res.json(result);
    }
  });
};

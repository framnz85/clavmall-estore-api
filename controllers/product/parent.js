const ObjectId = require("mongoose").Types.ObjectId;
const slugify = require("slugify");
const Category = require("../../models/product/category");
const Parent = require("../../models/product/parent");
const Product = require("../../models/product/product");
const mongoose = require("mongoose");
const { populateProduct } = require("../authority/common");

exports.create = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const { name, parent } = req.body;
    const newParent = await Parent(estoreid).collection.insertOne({
      name,
      parent: new ObjectId(parent),
      slug: slugify(name.toString().toLowerCase()),
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    });
    res.json(newParent);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send("Parent product already exist.");
    } else {
      res.status(400).send("Create parent product failed.");
    }
  }
};

exports.list = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const maxItem = req.params.count;
  const parents =
    maxItem > 0
      ? await Parent(estoreid)
          .aggregate([{ $sample: { size: parseInt(maxItem) } }])
          .exec()
      : await Parent(estoreid).find({}).sort({ name: 1 });

  res.json(parents);
};

exports.listsWithCatids = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const catids = req.body.catids;
    const parents = await Parent(estoreid)
      .find({
        parent: { $in: catids },
      })
      .sort({ name: 1 });

    res.json(parents);
  } catch (error) {
    res.status(400).send("Something in parents failed.");
  }
};

exports.update = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const { name, parent } = req.body;
    const category = await Category(estoreid).findOne({
      slug: req.params.parSlug,
    });
    const updated = await Parent(estoreid).findOneAndUpdate(
      { slug: req.params.slug, parent: new ObjectId(category._id) },
      { name, parent, slug: slugify(name.toString().toLowerCase()) },
      { new: true }
    );
    if (!updated) {
      res.status(404).send("No parent product exist under " + req.params.slug);
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(400).send("Delete parent product failed.");
  }
};

exports.remove = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const parent = await Parent(estoreid)
      .findOne({
        parent: new ObjectId(req.params.parent),
        slug: req.params.slug,
      })
      .select("_id name");
    const product = await Product(estoreid).findOne({
      parent: new ObjectId(parent._id),
    });
    if (product) {
      res
        .status(401)
        .send(
          `${parent.name} has product/s under it. Remove or unassign all of it first before deleting.`
        );
      return;
    }
    const deleted = await Parent(estoreid).findOneAndDelete({
      _id: new ObjectId(parent._id),
    });
    if (!deleted) {
      res.status(404).send(`No parent ${parent.name} exist`);
      return;
    }
    res.json(deleted);
  } catch (error) {
    res.status(400).send("Create parent product failed.");
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
    let products = await Product(estoreid)
      .aggregate([
        { $match: { activate: true } },
        { $sample: { size: 20 } },
        {
          $match: {
            $and: [
              { parent: new mongoose.Types.ObjectId(req.params.parid) },
              {
                $nor: [
                  {
                    $and: [
                      {
                        "noAvail.couid": new ObjectId(country._id),
                      },
                      {
                        "noAvail.addiv1": new ObjectId(addiv1._id),
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
                        "noAvail.couid": new ObjectId(country._id),
                      },
                      {
                        "noAvail.addiv1": new ObjectId(addiv1._id),
                      },
                      {
                        "noAvail.addiv2": new ObjectId(addiv2._id),
                      },
                      {
                        "noAvail.addiv3": undefined,
                      },
                    ],
                  },
                  {
                    $and: [
                      {
                        "noAvail.couid": new ObjectId(country._id),
                      },
                      {
                        "noAvail.addiv1": new ObjectId(addiv1._id),
                      },
                      {
                        "noAvail.addiv2": new ObjectId(addiv2._id),
                      },
                      {
                        "noAvail.addiv3": new ObjectId(addiv3._id),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ])
      .exec();

    products = await populateProduct(products, estoreid);

    res.json(products);
  } catch (error) {
    res.status(400).send("Getting parent products failed.");
  }
};

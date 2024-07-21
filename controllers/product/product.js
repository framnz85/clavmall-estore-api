const ObjectId = require("mongoose").Types.ObjectId;
const slugify = require("slugify");
const Product = require("../../models/product/product");
const User = require("../../models/user/user");
const { populateProduct } = require("../authority/common");

exports.create = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    req.body.slug = slugify(req.body.title.toString().toLowerCase());
    req.body.price = parseInt(req.body.price);
    req.body.category = ObjectId(req.body.category);
    req.body.subcats = req.body.subcats.map((subcat) => ObjectId(subcat));
    req.body.parent = ObjectId(req.body.parent);
    req.body.variants = req.body.variants.map((variant) => {
      return { ...variant, _id: new ObjectId() };
    });
    req.body.sold = 0;
    req.body.noAvail = [];
    req.body.activate = true;
    const newProduct = await Product(estoreid).collection.insertOne({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    });
    res.json(newProduct);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send("Product already exist.");
    } else {
      res.status(400).send("Create product failed.");
    }
  }
};

exports.read = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    let product = await Product(estoreid)
      .findOne({
        slug: req.params.slug,
      })
      .exec();

    product = await populateProduct([product], estoreid);

    res.json(product[0]);
  } catch (error) {
    res.status(400).send("Product search failed.");
  }
};

exports.update = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    req.body.slug = slugify(req.body.title.toString().toLowerCase());
    const updated = await Product(estoreid).findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true }
    );
    if (!updated) {
      res.status(404).send("No product exist under " + req.params.slug);
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(400).send("Update product failed.");
  }
};

exports.remove = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const deleted = await Product(estoreid)
      .findOneAndRemove({
        slug: req.params.slug,
      })
      .exec();
    res.json(deleted);
  } catch (error) {
    res.status(400).send("Product delete failed.");
  }
};

exports.imageupdate = async (req, res) => {
  const estoreid = req.headers.estoreid;
  await Product(estoreid).findOneAndUpdate(
    { slug: req.params.slug },
    { images: req.body.images },
    { new: true }
  );
};

exports.list = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const {
      sortkey,
      sort,
      currentPage,
      pageSize,
      searchQuery,
      category,
      subcat,
      parent,
    } = req.body;
    const curPage = currentPage || 1;
    let searchObj = searchQuery ? { $text: { $search: searchQuery } } : {};

    if (category)
      searchObj = {
        ...searchObj,
        category: new ObjectId(category),
      };

    if (subcat)
      searchObj = {
        ...searchObj,
        subcats: { $in: [ObjectId(subcat)] },
      };

    if (parent)
      searchObj = {
        ...searchObj,
        parent: new ObjectId(parent),
      };

    let products = await Product(estoreid)
      .find(searchObj)
      .skip((curPage - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize)
      .exec();

    products = await populateProduct(products, estoreid);

    const countProduct = await Product(estoreid).find(searchObj).exec();

    const query = searchQuery !== "" || Object.keys(searchObj).length > 0;

    res.json({
      products,
      count: countProduct.length,
      query: query,
    });
  } catch (error) {
    res.status(400).send("Listing product failed.");
  }
};

exports.random = async (req, res) => {
  const maxItem = req.params.count;
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
        { $sample: { size: parseInt(maxItem) } },
        {
          $match: {
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
        },
      ])
      .exec();

    products = await populateProduct(products, estoreid);

    res.json(products);
  } catch (error) {
    res.status(400).send("Listing product failed.");
  }
};

exports.productsCount = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const total = await Product(estoreid)
    .find({})
    .estimatedDocumentCount()
    .exec();
  res.json(total);
};

exports.productStar = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { star } = req.body;
  const email = req.user.email;
  const phone = req.user.phone;
  let user = {};

  let product = await Product(estoreid).findById(req.params.productId).exec();

  if (email) {
    user = await User(estoreid).findOne({ email }).exec();
  } else if (phone) {
    user = await User(estoreid).findOne({ phone }).exec();
  }

  let existingRatingObject = product.ratings.find(
    (ele) => ele.postedBy.toString() === user._id.toString()
  );

  if (existingRatingObject === undefined) {
    await Product(estoreid)
      .findByIdAndUpdate(
        product._id,
        {
          $push: { ratings: { star, postedBy: user._id } },
        },
        { new: true }
      )
      .exec();
  } else {
    await Product(estoreid)
      .updateOne(
        {
          ratings: { $elemMatch: existingRatingObject },
        },
        { $set: { "ratings.$.star": star } },
        { new: true }
      )
      .exec();
  }

  product = await populateProduct([product], estoreid);

  res.json(product);
};

exports.listRelated = async (req, res) => {
  const { estoreid, size } = req.headers;
  const product = await Product(estoreid).findById(req.params.productId).exec();

  let related = await Product(estoreid)
    .aggregate([
      {
        $match: {
          _id: { $ne: product._id },
          category: product.category,
          activate: true,
        },
      },
      { $sample: { size: size ? parseInt(size) : 60 } },
    ])
    .exec();

  related = await populateProduct(related, estoreid);

  res.json(related);
};

exports.listOtherVariant = async (req, res) => {
  const { estoreid, size } = req.headers;
  const product = await Product(estoreid).findById(req.params.productId).exec();

  let parent = await Product(estoreid)
    .aggregate([
      {
        $match: {
          _id: { $ne: product._id },
          parent: product.parent,
          activate: true,
        },
      },
      { $sample: { size: size ? parseInt(size) : 60 } },
    ])
    .exec();

  parent = await populateProduct(parent, estoreid);

  res.json(parent);
};

const handleSearchQuery = async (req, res, querySearch, address) => {
  const estoreid = req.headers.estoreid;
  const maxItem = req.params.count;
  const { country = {}, addiv1 = {}, addiv2 = {}, addiv3 = {} } = address;
  querySearch = {
    ...querySearch,
    activate: true,
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
  };

  try {
    let product = await Product(estoreid)
      .find(querySearch)
      .limit(parseInt(maxItem))
      .exec();

    product = await populateProduct(product, estoreid);

    res.json(product);
  } catch (error) {
    res.status(400).send("Query product failed.");
  }
};

const handleStarQuery = (req, res, querySearch, address, stars) => {
  const estoreid = req.headers.estoreid;
  const { country = {}, addiv1 = {}, addiv2 = {}, addiv3 = {} } = address;
  Product(estoreid)
    .aggregate([
      {
        $project: {
          document: "$$ROOT",
          floorAverage: {
            $floor: { $avg: "$ratings.star" },
          },
        },
      },
      { $match: { floorAverage: stars } },
    ])
    .exec((err, aggregates) => {
      if (err) res.status(400).send("Query product failed.");
      querySearch = {
        ...querySearch,
        _id: aggregates,
        activate: true,
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
      };
      Product(estoreid)
        .find(querySearch)
        .exec(async (err, product) => {
          if (err) res.status(400).send("Query product failed.");
          product = await populateProduct(product, estoreid);
          res.json(product);
        });
    });
};

exports.searchFilters = async (req, res) => {
  const { text, price, category, stars, subcategory, parent } = req.body.arg;
  const address = req.body.address;
  let querySearch = {};

  if (text) {
    querySearch = { ...querySearch, $text: { $search: text } };
  }
  if (price.length > 0) {
    querySearch = {
      ...querySearch,
      price: {
        $gte: price[0],
        $lte: price[1],
      },
    };
  }
  if (category && category.length > 0) {
    querySearch = { ...querySearch, category: { $in: category } };
  }
  if (subcategory && subcategory.length > 0) {
    querySearch = { ...querySearch, subcats: { $in: subcategory } };
  }
  if (parent && parent.length > 0) {
    querySearch = { ...querySearch, parent: { $in: parent } };
  }
  if (stars) {
    handleStarQuery(req, res, querySearch, address, stars);
  } else {
    await handleSearchQuery(req, res, querySearch, address);
  }
};

exports.bulkChangePrice = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { category, subcat, parent, supprice, suppricetype } = req.body.values;
  let querySearch = {};

  if (category)
    querySearch = { ...querySearch, category: new ObjectId(category) };
  if (subcat) querySearch = { ...querySearch, subcats: new ObjectId(subcat) };
  if (parent) querySearch = { ...querySearch, parent: new ObjectId(parent) };

  try {
    const updatedProducts = [];
    const products = await Product(estoreid).find(querySearch).exec();
    products.map(async (product) => {
      const finalSupPrice =
        suppricetype === "%"
          ? product.supplierPrice * (1 + supprice / 100)
          : parseFloat(product.supplierPrice) + parseFloat(supprice);
      const finalPrice =
        product.markuptype === "%"
          ? finalSupPrice * (1 + product.markup / 100)
          : parseFloat(finalSupPrice) + parseFloat(product.markup);
      updatedProducts.push({
        ...(product._doc ? product._doc : product),
        supplierPrice: finalSupPrice.toFixed(2),
        price: finalPrice.toFixed(2),
      });
      await Product(estoreid)
        .findOneAndUpdate(
          { _id: new ObjectId(product._id) },
          {
            supplierPrice: finalSupPrice.toFixed(2),
            price: finalPrice.toFixed(2),
          }
        )
        .exec();
    });
    res.json(updatedProducts);
  } catch (error) {
    res.status(400).send("Change product price failed.");
  }
};

exports.bulkChangeMarkup = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const {
    category,
    subcat,
    parent,
    supprice,
    suppricetype,
    markup,
    markuptype,
  } = req.body.values;
  let querySearch = {};

  if (category)
    querySearch = { ...querySearch, category: new ObjectId(category) };
  if (subcat) querySearch = { ...querySearch, subcats: new ObjectId(subcat) };
  if (parent) querySearch = { ...querySearch, parent: new ObjectId(parent) };

  try {
    const updatedProducts = [];
    const products = await Product(estoreid).find(querySearch).exec();
    products.map(async (product) => {
      const finalPrice =
        markuptype === "%"
          ? product.supplierPrice * (1 + markup / 100)
          : parseFloat(product.supplierPrice) + parseFloat(markup);
      updatedProducts.push({
        ...(product._doc ? product._doc : product),
        supplierPrice: product.supplierPrice.toFixed(2),
        price: finalPrice.toFixed(2),
      });
      await Product(estoreid)
        .findOneAndUpdate(
          { _id: new ObjectId(product._id) },
          {
            price: finalPrice.toFixed(2),
            markup,
            markuptype,
          }
        )
        .exec();
    });
    res.json(updatedProducts);
  } catch (error) {
    res.status(400).send("Change product price failed.");
  }
};

exports.bulkDeleteProduct = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { category, subcat, parent } = req.body.values;
  let querySearch = {};

  if (category)
    querySearch = { ...querySearch, category: new ObjectId(category) };
  if (subcat) querySearch = { ...querySearch, subcats: new ObjectId(subcat) };
  if (parent) querySearch = { ...querySearch, parent: new ObjectId(parent) };
  try {
    const products = await Product(estoreid).find(querySearch).exec();
    products.map(async (product) => {
      await Product(estoreid)
        .findOneAndRemove({
          _id: new ObjectId(product._id),
        })
        .exec();
    });
    res.json(products);
  } catch (error) {
    res.status(400).send("Deleting products has failed.");
  }
};

exports.bulkStatusProduct = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { category, subcat, parent, status } = req.body.values;
  let querySearch = {};

  if (category)
    querySearch = { ...querySearch, category: new ObjectId(category) };
  if (subcat) querySearch = { ...querySearch, subcats: new ObjectId(subcat) };
  if (parent) querySearch = { ...querySearch, parent: new ObjectId(parent) };

  try {
    const updatedProducts = [];
    const products = await Product(estoreid).find(querySearch).exec();
    products.map(async (product) => {
      updatedProducts.push({
        ...(product._doc ? product._doc : product),
        activate: status,
      });
      await Product(estoreid)
        .findOneAndUpdate(
          { _id: new ObjectId(product._id) },
          { activate: status }
        )
        .exec();
    });
    res.json(updatedProducts);
  } catch (error) {
    res.status(400).send("Change product status failed.");
  }
};

exports.bulkReferralProduct = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { category, subcat, parent, referral, referraltype } = req.body.values;
  let querySearch = {};

  if (category)
    querySearch = { ...querySearch, category: new ObjectId(category) };
  if (subcat) querySearch = { ...querySearch, subcats: new ObjectId(subcat) };
  if (parent) querySearch = { ...querySearch, parent: new ObjectId(parent) };

  try {
    const updatedProducts = [];
    const products = await Product(estoreid).find(querySearch).exec();
    products.map(async (product) => {
      updatedProducts.push({
        ...(product._doc ? product._doc : product),
        referral,
        referraltype,
      });
      await Product(estoreid)
        .findOneAndUpdate(
          { _id: new ObjectId(product._id) },
          { referral, referraltype }
        )
        .exec();
    });
    res.json(updatedProducts);
  } catch (error) {
    res.status(400).send("Change product referral failed.");
  }
};

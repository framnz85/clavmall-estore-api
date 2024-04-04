const ObjectId = require("mongoose").Types.ObjectId;
const slugify = require("slugify");

const Product = require("../../models/gratis/product");
const User = require("../../models/gratis/user");
const Category = require("../../models/gratis/category");
const { populateProduct } = require("./common");

exports.randomItems = async (req, res) => {
  const count = req.params.count;
  const estoreid = req.headers.estoreid;

  try {
    let products = await Product.aggregate([
      { $match: { activate: true, estoreid: ObjectId(estoreid) } },
      { $sample: { size: parseInt(count) } },
    ]).exec();

    products = await populateProduct(products);

    res.json(products);
  } catch (error) {
    res.json({ err: "Listing product failed." + error.message });
  }
};

exports.singleItems = async (req, res) => {
  const slug = req.params.slug;
  const estoreid = req.headers.estoreid;

  try {
    let products = await Product.find({
      slug,
      estoreid: ObjectId(estoreid),
    }).exec();

    products = await populateProduct(products);

    res.json(products);
  } catch (error) {
    res.json({ err: "Getting a product failed." + error.message });
  }
};

exports.itemsByBarcode = async (req, res) => {
  const barcode = req.params.barcode;
  const estoreid = req.headers.estoreid;
  const purpose = req.headers.purpose;

  try {
    let products = [];

    if (purpose === "read" || purpose === "inventory") {
      products = await Product.find({
        barcode,
        estoreid: ObjectId(estoreid),
      })
        .limit(10)
        .exec();
    } else {
      products = await Product.find({
        barcode,
      })
        .populate("estoreid")
        .limit(10)
        .exec();
    }

    products = await populateProduct(products);

    res.json(products);
  } catch (error) {
    res.json({ err: "Getting a product failed." + error.message });
  }
};

exports.loadInitProducts = async (req, res) => {
  const estoreidFrom = Object("613216389261e003d696cc65");
  const estoreid = ObjectId(req.headers.estoreid);
  const email = req.user.email;

  try {
    const user = await User.findOne({ email }).exec();
    if (user) {
      const products = await Product.find({
        estoreid: estoreidFrom,
        initial: 1,
      }).select("-_id -createdAt -updatedAt -__v");
      const copyingProducts = products.map((product) => {
        const images = product.images.map((img) => {
          return { ...img, fromid: estoreidFrom };
        });
        return { ...product._doc, images, estoreid };
      });
      const newProducts = await Product.insertMany(copyingProducts);

      if (newProducts.length) {
        const categories = await Category.find({
          estoreid: estoreidFrom,
          initial: 1,
        });

        categories.forEach(async (category) => {
          const newCategory = new Category({
            name: category.name,
            slug: category.slug,
            estoreid,
          });
          await newCategory.save();
          await Product.updateMany(
            { category: ObjectId(category._id), estoreid },
            { category: ObjectId(newCategory._id) },
            { new: true }
          );
        });
        res.json({ ok: true });
      }
    } else {
      res.json({ err: "Cannot fetch this order." });
    }
  } catch (error) {
    res.json({ err: "Getting a product failed." + error.message });
  }
};

exports.getAdminItems = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const {
      sortkey,
      sort,
      currentPage,
      pageSize,
      searchQuery,
      category,
      barcode,
    } = req.body;

    let searchObj = searchQuery
      ? { $text: { $search: searchQuery }, estoreid: ObjectId(estoreid) }
      : { estoreid: ObjectId(estoreid) };

    if (category && category !== "1") {
      searchObj = {
        ...searchObj,
        category: ObjectId(category),
      };
    }

    if (barcode) {
      searchObj = {
        ...searchObj,
        barcode: { $ne: null },
      };
    }

    let products = await Product.find(searchObj)
      .skip((currentPage - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize)
      .exec();

    if (products.length < 1 && searchQuery) {
      products = await Product.find({
        title: { $regex: searchQuery, $options: "i" },
        estoreid: ObjectId(estoreid),
      })
        .skip((currentPage - 1) * pageSize)
        .sort({ [sortkey]: sort })
        .limit(pageSize)
        .exec();
    }

    products = await populateProduct(products);

    const countProduct = await Product.find(searchObj).exec();

    res.json({ products, count: countProduct.length });
  } catch (error) {
    res.json({ err: "Listing product failed. " + error.message });
  }
};

exports.addProduct = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const platform = req.headers.platform;
  try {
    if (platform === "cosmic") {
      const checkExist = await Product.findOne({
        slug: slugify(req.body.title.toString().toLowerCase()),
        estoreid: ObjectId(estoreid),
      });
      if (checkExist) {
        res.json({
          err: "Sorry, this product is already existing. Choose another tittle for the product.",
        });
      } else {
        const product = new Product({
          ...req.body,
          slug: slugify(req.body.title.toString().toLowerCase()),
          estoreid: ObjectId(estoreid),
        });
        await product.save();
        res.json(product);
      }
    } else {
      res.json({
        err: `Sorry, your account is not from cosmic.`,
      });
    }
  } catch (error) {
    res.json({ err: "Adding product failed. " + error.message });
  }
};

exports.searchProduct = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const text = req.body.text;
  const catSlug = req.body.catSlug;
  const price = req.body.price;
  let querySearch = {};
  let products = [];

  if (text) {
    querySearch = { ...querySearch, $text: { $search: text } };
  }

  if (catSlug && catSlug !== "all") {
    const category = await Category.findOne({
      slug: catSlug,
      estoreid: ObjectId(estoreid),
    });
    if (category)
      querySearch = { ...querySearch, category: ObjectId(category._id) };
  }

  if (price)
    querySearch = { ...querySearch, price: { $gt: price[0], $lt: price[1] } };

  try {
    if (Object.keys(querySearch).length) {
      products = await Product.find({
        ...querySearch,
        estoreid: ObjectId(estoreid),
      }).exec();

      if (products.length < 1 && text) {
        products = await Product.find({
          title: { $regex: text, $options: "i" },
          estoreid: ObjectId(estoreid),
        }).exec();
      }

      products = await populateProduct(products);
    } else {
      products = await Product.find({
        estoreid: ObjectId(estoreid),
      }).exec();
    }
    res.json(products);
  } catch (error) {
    res.json({ err: "Searching products failed. " + error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const prodid = req.params.prodid;
  const estoreid = req.headers.estoreid;
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: ObjectId(prodid),
        estoreid: ObjectId(estoreid),
      },
      req.body,
      { new: true }
    );
    res.json(product);
  } catch (error) {
    res.json({ err: "Updating product failed. " + error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const prodid = req.params.prodid;
  const estoreid = req.headers.estoreid;
  try {
    const product = await Product.findOneAndDelete({
      _id: ObjectId(prodid),
      estoreid: ObjectId(estoreid),
    }).exec();
    res.json(product);
  } catch (error) {
    res.json({ err: "Updating product failed. " + error.message });
  }
};

exports.checkImageUser = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const publicid = req.params.publicid;
  const defaultestore = req.params.defaultestore;

  try {
    let product = await Product.findOne({
      images: {
        $elemMatch: { public_id: publicid },
      },
      estoreid: ObjectId(defaultestore),
    }).exec();

    if (product) {
      if (estoreid === defaultestore) {
        res.json({ delete: true });
      } else {
        res.json({ delete: false });
      }
    } else {
      product = await Product.findOne({
        images: {
          $elemMatch: { public_id: publicid },
        },
        estoreid: ObjectId(estoreid),
      }).exec();

      if (product && product.images[0] && product.images[0].fromid) {
        if (product.images[0].fromid === estoreid) {
          res.json({ delete: true });
        } else {
          res.json({ delete: false });
        }
      } else {
        res.json({ delete: true });
      }
    }
  } catch (error) {
    res.status(400).send("Checking image user failed.");
  }
};

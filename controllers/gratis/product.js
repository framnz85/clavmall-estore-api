const ObjectId = require("mongoose").Types.ObjectId;
const slugify = require("slugify");

const Product = require("../../models/gratis/product");
const User = require("../../models/gratis/user");
const Category = require("../../models/gratis/category");
const Estore = require("../../models/gratis/estore");
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

  try {
    let products = await Product.find({
      barcode,
      estoreid: ObjectId(estoreid),
    }).exec();

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
        return { ...product._doc, estoreid };
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

    if (category) {
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
    const estore = await Estore.findOne({
      _id: ObjectId(estoreid),
    })
      .select("productLimit")
      .exec();

    const productCount = await Product.countDocuments({
      estoreid: ObjectId(estoreid),
    }).exec();

    if (productCount < estore.productLimit || platform === "cosmic") {
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
        err: `Sorry, you already uploaded ${estore.productLimit} products on this account. Go to Upgrades to increase your limit.`,
      });
    }
  } catch (error) {
    res.json({ err: "Listing product failed. " + error.message });
  }
};

exports.searchProduct = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const text = req.body.text;
  const catSlug = req.body.catSlug;
  let querySearch = {};

  if (text) {
    querySearch = { ...querySearch, $text: { $search: text } };
  }

  if (catSlug) {
    const category = await Category.findOne({
      slug: catSlug,
      estoreid: ObjectId(estoreid),
    });
    if (category)
      querySearch = { ...querySearch, category: ObjectId(category._id) };
  }

  try {
    if (Object.keys(querySearch).length) {
      let products = await Product.find({
        ...querySearch,
        estoreid: ObjectId(estoreid),
      }).exec();

      products = await populateProduct(products);

      res.json(products);
    } else {
      res.json([]);
    }
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
    const product = await Product.findOne({
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
      res.json({ delete: true });
    }
  } catch (error) {
    res.status(400).send("Checking image user failed.");
  }
};

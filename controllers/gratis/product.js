const ObjectId = require("mongoose").Types.ObjectId;
const slugify = require("slugify");

const Product = require("../../models/gratis/product");
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

exports.getAdminItems = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const { sortkey, sort, currentPage, pageSize, searchQuery, category } =
      req.body;

    let searchObj = searchQuery
      ? { $text: { $search: searchQuery }, estoreid: ObjectId(estoreid) }
      : { estoreid: ObjectId(estoreid) };

    if (category) {
      searchObj = {
        ...searchObj,
        category: ObjectId(category),
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
  try {
    const product = new Product({
      ...req.body,
      slug: slugify(req.body.title.toString().toLowerCase()),
      estoreid: ObjectId(estoreid),
    });
    await product.save();
    res.json(product);
  } catch (error) {
    res.json({ err: "Listing product failed. " + error.message });
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

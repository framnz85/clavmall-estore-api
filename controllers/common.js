const Category = require("../models/category");
const Subcat = require("../models/subcat");
const Parent = require("../models/parent");
const Product = require("../models/product");
const User = require("../models/user");

exports.populateProduct = async (products, estoreid) => {
  let categories = [];
  let subcats = [];
  let parents = []

  products = products.map((product) => {
    categories.push(product.category)
    subcats = [...subcats, ...product.subcats]
    parents.push(product.parent)
    return product;
  })

  const categoryList = await Category(estoreid).find({ _id: {$in: categories} }).exec();
  const subcatList = await Subcat(estoreid).find({ _id: {$in: subcats} }).exec();
  const parentList = await Parent(estoreid).find({ _id: {$in: parents} }).exec();

  products = products.map((product) => {
    return {
      ...(product._doc ? product._doc : product) ,
      category: categoryList.filter(cat => cat._id.toString() === product.category.toString())[0],
      subcats: product.subcats.map(subcat => subcatList.filter(sub => sub._id.toString() === subcat.toString())[0]),
      parent: parentList.filter(par => par._id.toString() === product.parent.toString())[0],
    };
  })

  return products;
}

exports.productsProduct = async (source, estoreid) => {
  let prodId = [];
  source[0].products.map(prod => {
    prodId.push(prod.product)
  });
  const result = await Product(estoreid).find({ _id: { $in: prodId } }).exec();
  const products = source[0].products.map(prod => {
    return {
      ...(prod._doc ? prod._doc : prod),
      product: result.filter(p => p._id.toString() === prod.product.toString())[0]
    }
  });

  return products;
}

exports.orderProductUser = async (source, estoreid) => {
    let popUserId = [];
    source.map(ord => {
      popUserId.push(ord.orderedBy)
    });

    const users = await User(estoreid).find({ _id: { $in: popUserId } }).exec();

    source = source.map(ord => {
      return {
        ...(ord._doc ? ord._doc : ord),
        orderedBy: users.filter(u => u._id.toString() === ord.orderedBy.toString())[0]
      }
    });

  return source;
}

exports.orderProductsProduct = async (orders, estoreid) => {
  let prodId = [];
  orders.map(ord => {
    ord.products.map(prod => {
      prodId.push(prod.product)
    });
  });

  const result = await Product(estoreid).find({ _id: { $in: prodId } }).exec();

  orders = orders.map(ord => {
    const products = ord.products.map(prod => {
      return {
        ...(prod._doc ? prod._doc : prod),
        product: result.filter(p => p._id.toString() === prod.product.toString())[0]
      }
    });
    return { ...(ord._doc ? ord._doc : ord), products }
  });

  return orders;
}

exports.populateWishlist = async (wishlist, estoreid) => {
  let prodId = [];
  wishlist.map(wish => {
    prodId.push(wish)
  });

  const result = await Product(estoreid).find({ _id: { $in: prodId } }).exec();

  return result;
}
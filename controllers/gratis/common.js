const Category = require("../../models/gratis/category");

exports.populateProduct = async (products) => {
  let categories = [];

  products = products.map((product) => {
    categories.push(product.category);
    return product;
  });

  const categoryList = await Category.find({ _id: { $in: categories } }).exec();

  products = products.map((product) => {
    return {
      ...(product._doc ? product._doc : product),
      category: categoryList.filter(
        (cat) => cat._id.toString() === product.category.toString()
      )[0],
    };
  });

  return products;
};

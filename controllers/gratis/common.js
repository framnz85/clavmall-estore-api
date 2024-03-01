const Category = require("../../models/gratis/category");
const Raffle = require("../../models/gratis/raffle");
const User = require("../../models/gratis/user");

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

exports.createRaffle = async (
  estoreid,
  owner,
  orderid,
  raffleDate,
  raffleEntryAmount,
  amount
) => {
  const raffleInsert = { estoreid, owner, orderid, raffleDate };
  const raffleCount = Math.floor(
    parseFloat(amount) / parseFloat(raffleEntryAmount)
  );

  const raffleEntries = Array(raffleCount).fill(raffleInsert);

  Raffle.insertMany(raffleEntries);
};

exports.populateRaffle = async (entries) => {
  let owners = [];

  entries = entries.map((entry) => {
    owners.push(entry.owner);
    return entry;
  });

  const ownerList = await User.find({ _id: { $in: owners } }).exec();

  entries = entries.map((entry) => {
    return {
      ...(entry._doc ? entry._doc : entry),
      owner: ownerList.find(
        (owner) => owner._id.toString() === entry.owner.toString()
      ),
    };
  });

  return entries;
};

const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;
const Order = require("../models/order");
const Cart = require("../models/cart");
const User = require("../models/user");
const Product = require("../models/product");
const {  orderProductUser, orderProductsProduct } = require("./common");

exports.orders = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const {
      sortkey,
      sort,
      currentPage,
      pageSize,
      searchQuery,
      minPrice,
      maxPrice,
      dateFrom,
      dateTo,
      status,
      payment,
    } = req.body;
    let searchObj = {};
    const curPage = currentPage || 1;

    let orderIds = searchQuery
      ? await Order(estoreid).find({ $text: { $search: searchQuery } }, { _id: 1 }).exec() : [];

    orderIds = orderIds.map((orderId) => new mongoose.Types.ObjectId(orderId._id))

    const userIds = searchQuery
      ? await User(estoreid).find({ $text: { $search: searchQuery } }, { _id: 1 }).exec() : [];

    if (searchQuery && orderIds.length > 0) {
      searchObj = { _id: { $in: orderIds } };
    } else if (searchQuery || userIds.length > 0) {
      searchObj = {
        ...searchObj, orderedBy: {
          $in: userIds.map((userId) => new mongoose.Types.ObjectId(userId._id))
        }
      };
    }

    if (minPrice > 0) searchObj = {
      ...searchObj, grandTotal: { $gte: minPrice }
    }

    if (maxPrice > 0) searchObj = {
      ...searchObj, grandTotal: { $gte: minPrice, $lte: maxPrice }
    }

    if (dateFrom && dateTo) searchObj = {
      ...searchObj, createdAt: { $gte: dateFrom, $lte: dateTo }
    }

    if (status) searchObj = {
      ...searchObj, orderStatus: status
    }

    if (payment) searchObj = {
      ...searchObj, "paymentOption.category": payment
    }

    let orders = await Order(estoreid).find(searchObj)
      .skip((curPage - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize)
      .exec();
    
    orders = await orderProductUser(orders, estoreid);

    orders = await orderProductsProduct(orders, estoreid);

    const countOrder = await Order(estoreid).find(searchObj).exec();

    const query = searchQuery !== "" || Object.keys(searchObj).length > 0;

    res.json({ orders, count: countOrder.length, query: query });
  } catch (error) {
    res.status(400).send("Listing orders failed.");
  }
};

exports.order = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const orderid = new ObjectId(req.params.orderid);
  let order = await Order(estoreid).find({ _id: orderid }).exec();
    
  order = await orderProductUser(order, estoreid);

  order = await orderProductsProduct(order, estoreid);
  
  res.json(order);
}

exports.carts = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const {
      sortkey,
      sort,
      currentPage,
      pageSize,
      searchQuery,
    } = req.body;

    let searchObj = {};
    const curPage = currentPage || 1;

    const userIds = searchQuery
      ? await User(estoreid).find({ $text: { $search: searchQuery } }, { _id: 1 }).exec() : [];

    if (searchQuery || userIds.length > 0) {
      searchObj = {
        ...searchObj, orderedBy: {
          $in: userIds.map((userId) => new mongoose.Types.ObjectId(userId._id))
        }
      };
    }

    let carts = await Cart(estoreid).find(searchObj, "_id cartTotal orderedBy createdAt")
      .skip((curPage - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize)
      .exec();
    
    carts = await orderProductUser(carts, estoreid);

    const countOrder = await Order(estoreid).find(searchObj).exec();

    const query = searchQuery !== "" || Object.keys(searchObj).length > 0;

    res.json({ carts, count: countOrder.length, query: query });
  } catch (error) {
    res.status(400).send("Listing orders failed.");
  }
};

exports.cart = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const cartid = new ObjectId(req.params.cartid);
  let cart = await Cart(estoreid).find({ _id: cartid }).exec();
    
  cart = await orderProductUser(cart, estoreid);

  cart = await orderProductsProduct(cart, estoreid);
  
  res.json(cart);
}

exports.orderStatus = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const order = req.body.data;

  let updated = await Order(estoreid).findByIdAndUpdate(
    order._id,
    order,
    { new: true }
  ).exec();

  res.json(updated);
};

exports.checkImageUser = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const publicid = req.params.publicid;

  try {
    const product = await Product(estoreid).findOne({
      images: { 
        $elemMatch: { public_id: publicid } 
      }
    }).exec();

    res.json(product);
  } catch (error) {
    res.status(400).send("Checking image user failed.");
  }
};
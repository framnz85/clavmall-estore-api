const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const User = require("../models/user");
const Cart = require("../models/cart");
const Order = require("../models/order");
const {
  productsProduct,
  orderProductUser,
  orderProductsProduct
} = require("./common");

exports.order = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  const phone = req.user.phone;
  let user = {};
  const orderid = new ObjectId(req.params.orderid);

  if (email) {
    user = await User(estoreid).findOne({ email }).exec();
  } else if (phone) {
    user = await User(estoreid).findOne({ phone }).exec();
  }

  let order = await Order(estoreid).find({ _id: orderid, orderedBy: user._id }).exec();

  const products = await productsProduct(order, estoreid);
  
  order[0] = { ...order[0] }
  order[0] = { ...order[0]._doc, products, orderedBy: user }
  
  res.json(order);
}

exports.createOrder = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  const phone = req.user.phone;
  let user = {};
  const history = [];
  let { paymentOption, orderCode, sellerTxnID } = req.body.orderObjects;
  
  if (email) {
    user = await User(estoreid).findOne({ email }).exec();
  } else if (phone) {
    user = await User(estoreid).findOne({ phone }).exec();
  }
  
  if (sellerTxnID) {
    history.push({
      historyDesc: "Paid",
      historyMess: "Paid with Seller's Transaction/Payment ID: " + sellerTxnID
    })
  }

  const { products, cartTotal, delfee, discount, servefee, grandTotal } =
    await Cart(estoreid).findOne({
      orderedBy: user._id,
    }).exec();
  
  paymentOption = {
    ...paymentOption,
    payid: ObjectId(paymentOption.payid)
  };

  delete paymentOption.details;
  delete paymentOption.names;

  Order(estoreid).collection.insertOne({
    orderCode,
    products,
    paymentOption,
    cartTotal,
    delfee,
    discount,
    servefee,
    grandTotal,
    orderedBy: user._id,
    delAddress: user.address,
    history,
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0
  });

  res.json({ ok: true });
};

exports.orders = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  const phone = req.user.phone;
  let user = {};

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

    if (email) {
      user = await User(estoreid).findOne({ email }).exec();
    } else if (phone) {
      user = await User(estoreid).findOne({ phone }).exec();
    }

    let orderIds = searchQuery
      ? await Order(estoreid).find({ $text: { $search: searchQuery }, orderedBy: user._id }, { _id: 1 }).exec() : [];

    orderIds = orderIds.map((orderId) => new mongoose.Types.ObjectId(orderId._id))

    if (searchQuery && orderIds.length > 0) {
      searchObj = { _id: { $in: orderIds } };
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

    let orders = await Order(estoreid).find({
      ...searchObj, orderedBy: user._id
    })
      .skip((curPage - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize)
      .exec();
    
    orders = await orderProductUser(orders, estoreid);

    orders = await orderProductsProduct(orders, estoreid);

    const countOrder = await Order(estoreid).find({
      ...searchObj, orderedBy: user._id
    }).exec();

    const query = searchQuery !== "" || Object.keys(searchObj).length > 0;

    res.json({ orders, count: countOrder.length, query: query });
  } catch (error) {
    res.status(400).send("Getting user orders failed.");
  }
};

exports.updateOrder = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const orderid = req.params.orderid;
  const email = req.user.email;
  const phone = req.user.phone;
  let user = {};

  if (email) {
    user = await User(estoreid).findOne({ email }).exec();
  } else if (phone) {
    user = await User(estoreid).findOne({ phone }).exec();
  }

  const { products, cartTotal, delfee, discount, servefee, grandTotal } =
    await Cart(estoreid).findOne({
      orderedBy: user._id,
    }).exec();

  const updated = await Order(estoreid).findOneAndUpdate(
    { _id: orderid },
    {
      products,
      cartTotal,
      delfee,
      discount,
      servefee,
      grandTotal,
    },
    { new: true }
  );

  res.json(updated);
};

exports.updatePayment = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const orderid = req.params.orderid;

  const updated = await Order(estoreid).findOneAndUpdate(
    { _id: orderid },
    {
      paymentOption: req.body,
    },
    { new: true }
  );

  res.json(updated);
};

exports.checkExistCart = async (req, res) => {
  const estoreid = req.headers.estoreid;  const email = req.user.email;
  const phone = req.user.phone;
  let user = {};
  try {
    if (email) {
      user = await User(estoreid).findOne({ email }).exec();
    } else if (phone) {
      user = await User(estoreid).findOne({ phone }).exec();
    }
    let cart = await Cart(estoreid).find({ orderedBy: user._id }).exec();

    cart = await orderProductsProduct(cart, estoreid);

    res.json({ cart });
  } catch (error) {
    res.status(400).send("Listing cart failed.");
  }
};
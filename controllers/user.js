const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const User = require("../models/user");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const Order = require("../models/order");
const { MyAddiv3 } = require("../models/address/myAddiv3");
const {
  populateProduct,
  productsProduct,
  orderProductUser,
  orderProductsProduct,
  populateWishlist
} = require("./common");

exports.listUsers = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { sortkey, sort, currentPage, pageSize, searchQuery } = req.body;
  const curPage = currentPage || 1;
  let searchObj = searchQuery ? { $text: { $search: searchQuery } } : {};

  const users = await User(estoreid).find(searchObj)
    .skip((curPage - 1) * pageSize)
    .sort({ superAdmin: -1, role: 1, [sortkey]: sort })
    .limit(pageSize)
    .exec();
  
  const countUsers = await User(estoreid).find({}).exec();
  
  res.json({users, count: countUsers.length});
};

exports.userCart = async (req, res) => {
  const { cart } = req.body;
  const estoreid = req.headers.estoreid;

  let products = [];

  const user = await User(estoreid).findOne({ email: req.user.email }).exec();

  let cartExistByThisUser = await Cart(estoreid).findOne({ orderedBy: user._id }).exec();

  if (cartExistByThisUser) {
    cartExistByThisUser.remove();
  }

  for (let i = 0; i < cart.length; i++) {
    let object = {};

    object.product = cart[i]._id;
    object.count = cart[i].count;
    object.variant = cart[i].variant;

    let productFromDb = await Product(estoreid).findById(cart[i]._id)
      .select("price")
      .exec();
    object.price = productFromDb.price;
    cart[i] = { ...cart[i], price: productFromDb.price };

    products.push(object);
  }

  let cartTotal = 0;
  for (let i = 0; i < products.length; i++) {
    products[i].product = ObjectId(products[i].product);
    products[i].variant = ObjectId(products[i].variant);
    cartTotal = cartTotal + products[i].price * products[i].count;
  }

  Cart(estoreid).collection.insertOne({
    products,
    cartTotal,
    orderedBy: user._id,
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0
  });

  res.json({ cart });
};

exports.order = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const user = await User(estoreid).findOne({ email: req.user.email }).exec();
  const orderid = new ObjectId(req.params.orderid);

  let order = await Order(estoreid).find({ _id: orderid, orderedBy: user._id }).exec();

  const products = await productsProduct(order, estoreid);
  
  order[0] = { ...order[0] }
  order[0] = { ...order[0]._doc, products, orderedBy: user }
  
  res.json(order);
}

exports.getUserCart = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const coucode = req.params.coucode;
  const addiv3Id = new ObjectId(req.params.addiv3Id);

  try {
    const user = await User(estoreid).findOne({ email: req.user.email }).exec();

    const addiv3 = await MyAddiv3(coucode, estoreid).findOne({ _id: addiv3Id }).exec();

    let { 
      maxorder,
      delfee,
      delfeetype,
      discount,
      discounttype,
      servefee,
      servefeetype,
     } = addiv3;

    let cart = await Cart(estoreid).findOne({ orderedBy: user._id }).exec();

    const products = await productsProduct([cart], estoreid);
  
    cart = { ...cart }
    cart = { ...cart._doc, products }

    if (cart) {
      const { products, cartTotal } = cart;

      const subtotal = cartTotal;
      let grandTotal = subtotal;

      if (discount > 0 && subtotal > 0) {
          discount = Number(
          discounttype === "%" ? (subtotal * discount) / 100 : discount
          );
      } else {
          discount = 0;
      }

      if (delfee > 0 && subtotal > 0) {
          delfee =
          subtotal < maxorder
              ? Number(delfeetype === "%" ? (subtotal * delfee) / 100 : delfee)
              : 0;
      } else {
          delfee = 0;
      }

      if (servefee > 0 && subtotal > 0) {
          servefee = Number(
          servefeetype === "%" ? (subtotal * servefee) / 100 : servefee
          );
      } else {
          servefee = 0;
      }

      if (discount > 0) {
          grandTotal = grandTotal - discount;
      }

      if (delfee > 0) {
          grandTotal = grandTotal + delfee;
      }

      if (servefee > 0) {
          grandTotal = grandTotal + servefee;
      }
      
      res.json({ products, cartTotal, delfee, discount, servefee, grandTotal });
    }
  } catch (error) {
    res.status(400).send("Getting user cart failed.");
  }
};

exports.emptyCart = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const user = await User(estoreid).findOne({ email: req.user.email }).exec();

  let cart = await Cart(estoreid).findOneAndRemove({ orderedBy: user._id }).exec();

  res.json(cart);
};

exports.saveAddress = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const addiv3Id = req.body.address.addiv3._id;
  const coucode = req.body.address.country.countryCode;
  const homeAddiv3Id = req.body.homeAddress.addiv3._id;
  const homeCoucode = req.body.homeAddress.country.countryCode;
  const coupon = req.body.coupon;

  const addiv3 = await MyAddiv3(coucode, estoreid).findOne({ _id: addiv3Id }).exec();
  const homeAddiv3 = await MyAddiv3(homeCoucode, estoreid)
    .findOne({ _id: homeAddiv3Id })
    .exec();

  const user = await User(estoreid).findOneAndUpdate(
    { email: req.user.email },
    {
      address: { ...req.body.address, addiv3 },
      homeAddress: { ...req.body.homeAddress, homeAddiv3 },
    }
  ).exec();

  let couponAmount = 0;

  const { cartTotal } = await Cart(estoreid).findOne({ orderedBy: user._id }).exec();

  const validCoupon = await Coupon(estoreid).findOne({ code: coupon }).exec();

  if (
    validCoupon !== null
    && validCoupon.activate
    && validCoupon.expiry >= new Date()
  ) couponAmount = (cartTotal * validCoupon.discount) / 100;

  let {
    maxorder,
    delfee,
    delfeetype,
    discount,
    discounttype,
    servefee,
    servefeetype,
  } = addiv3;

  const subtotal = cartTotal;
  let grandTotal = subtotal;

  if (discount > 0 && subtotal > 0) {
      discount = Number(
      discounttype === "%" ? (subtotal * discount) / 100 : discount
      );
  } else {
      discount = 0;
  }

  if (delfee > 0 && subtotal > 0) {
      delfee =
      subtotal < maxorder
          ? Number(delfeetype === "%" ? (subtotal * delfee) / 100 : delfee)
          : 0;
  } else {
      delfee = 0;
  }

  if (servefee > 0 && subtotal > 0) {
      servefee = Number(
      servefeetype === "%" ? (subtotal * servefee) / 100 : servefee
      );
  } else {
      servefee = 0;
  }

  if (couponAmount > 0) {
      discount = discount + couponAmount;
  }

  if (discount > 0) {
      grandTotal = grandTotal - discount;
  }

  if (delfee > 0) {
      grandTotal = grandTotal + delfee;
  }

  if (servefee > 0) {
      grandTotal = grandTotal + servefee;
  }

  Cart(estoreid).findOneAndUpdate(
    { orderedBy: user._id },
    {
      cartTotal,
      delfee,
      discount,
      servefee,
      grandTotal,
    },
    { new: true }
  ).exec();

  res.json({
    addiv3,
    cartCalculation: {
      subtotal,
      delfee,
      discount,
      servefee,
      grandTotal,
    },
  });
};

exports.applyCouponToUserCart = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { coupon } = req.body;

  if(coupon.length > 0){
    const validCoupon = await Coupon(estoreid).findOne({ code: coupon }).exec();
    if (validCoupon === null) {
      return res.json({
        err: "Invalid Coupon",
      });
    } else if (!validCoupon.activate) {
      return res.json({
        err: "Coupon is not active",
      });
    }else if (validCoupon.expiry < new Date()) {
      return res.json({
        err: "Coupon is expired",
      });
    }

    const user = await User(estoreid).findOne({ email: req.user.email }).exec();

    const { cartTotal } = await Cart(estoreid).findOne({ orderedBy: user._id }).exec();

    const couponAmount = (cartTotal * validCoupon.discount) / 100;
    
    res.json({couponAmount});
  } else {
    res.json({couponAmount : 0});
  }
};

exports.createOrder = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const history = [];
  let { paymentOption, orderCode, sellerTxnID } = req.body.orderObjects;
  const user = await User(estoreid).findOne({ email: req.user.email }).exec();
  
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
    history,
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0
  });

  res.json({ ok: true });
};

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

    let user = await User(estoreid).findOne({ email: req.user.email }).exec();

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

exports.addToWishlist = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { productId } = req.body;

  await User(estoreid).findOneAndUpdate(
    { email: req.user.email },
    { $addToSet: { wishlist: productId } }
  ).exec();

  let list = await User(estoreid).findOne({ email: req.user.email })
    .select("wishlist")
    .exec();
  
  let wishlist = await populateWishlist(list.wishlist, estoreid);
  wishlist = await populateProduct(wishlist, estoreid);
  list = { ...(list._doc ? list._doc : list) , wishlist }

  res.json(list);
};

exports.wishlist = async (req, res) => {
  const estoreid = req.headers.estoreid;
  let list = await User(estoreid).findOne({ email: req.user.email })
    .select("wishlist")
    .exec();
  
  let wishlist = await populateWishlist(list.wishlist, estoreid);
  wishlist = await populateProduct(wishlist, estoreid);
  list = { ...(list._doc ? list._doc : list) , wishlist }

  res.json(list);
};

exports.removeFromWishlist = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { productId } = req.params;
  await User(estoreid).findOneAndUpdate(
    { email: req.user.email },
    { $pull: { wishlist: productId } }
  ).exec();

  res.json({ ok: true });
};

exports.updateProfile = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { values } = req.body;
  await User(estoreid).findOneAndUpdate(
    { email: req.user.email },
    values
  ).exec();

  res.json({ ok: true });
};

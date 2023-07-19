const ObjectId = require("mongoose").Types.ObjectId;

const User = require("../../models/gratis/user");
const Cart = require("../../models/gratis/cart");
const Product = require("../../models/gratis/product");
const Order = require("../../models/gratis/order");

exports.userOrder = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  const orderid = req.params.orderid;

  try {
    const user = await User.findOne({ email }).exec();
    if (user) {
      const order = await Order.findOne({
        _id: ObjectId(orderid),
        orderedBy: user._id,
        estoreid: Object(estoreid),
      })
        .populate("products.product")
        .populate("orderedBy")
        .populate("paymentOption")
        .exec();
      if (order) {
        res.json(order);
      } else {
        res.json({ err: "Sorry, there is no data on this order." });
      }
    } else {
      res.json({ err: "Cannot fetch this order." });
    }
  } catch (error) {
    res.json({ err: "Fetching an order failed. " + error.message });
  }
};

exports.userOrders = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;

  try {
    const user = await User.findOne({ email }).exec();
    if (user) {
      const orders = await Order.find({
        orderedBy: user._id,
        estoreid: Object(estoreid),
      })
        .sort({ createdAt: -1 })
        .populate("products.product")
        .populate("orderedBy")
        .populate("paymentOption")
        .exec();
      res.json(orders);
    } else {
      res.json({ err: "Cannot fetch user orders." });
    }
  } catch (error) {
    res.json({ err: "Fetching orders failed. " + error.message });
  }
};

exports.adminOrder = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const orderid = req.params.orderid;

  try {
    const order = await Order.findOne({
      _id: ObjectId(orderid),
      estoreid: Object(estoreid),
    })
      .populate("products.product")
      .populate("orderedBy")
      .populate("paymentOption")
      .exec();
    if (order) {
      res.json(order);
    } else {
      res.json({ err: "Sorry, there is no data on this order." });
    }
  } catch (error) {
    res.json({ err: "Fetching an order failed. " + error.message });
  }
};

exports.adminOrders = async (req, res) => {
  const estoreid = req.headers.estoreid;

  try {
    const orders = await Order.find({
      estoreid: Object(estoreid),
    })
      .sort({ createdAt: -1 })
      .populate("products.product")
      .populate("orderedBy")
      .populate("paymentOption")
      .exec();
    res.json(orders);
  } catch (error) {
    res.json({ err: "Fetching orders failed. " + error.message });
  }
};

exports.updateCart = async (req, res) => {
  const { cart } = req.body;
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  let products = [];

  try {
    const user = await User.findOne({ email }).exec();
    if (user) {
      await Cart.deleteMany({
        orderedBy: user._id,
        estoreid: ObjectId(estoreid),
      }).exec();
      for (let i = 0; i < cart.length; i++) {
        let object = {};

        object.product = cart[i]._id;
        object.count = cart[i].count;

        const productFromDb = await Product.findOne({
          _id: ObjectId(cart[i]._id),
          estoreid: ObjectId(estoreid),
        })
          .select("price")
          .exec();
        object.price = productFromDb.price;
        cart[i] = { ...cart[i], price: productFromDb.price };

        products.push(object);
      }
      let cartTotal = 0;
      for (let i = 0; i < products.length; i++) {
        products[i].product = ObjectId(products[i].product);
        cartTotal = cartTotal + products[i].price * products[i].count;
      }

      Cart.collection.insertOne({
        estoreid: ObjectId(estoreid),
        products,
        cartTotal,
        orderedBy: user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      });

      res.json({ cart });
    } else {
      res.json({ err: "Cannot fetch the cart details." });
    }
  } catch (error) {
    res.json({ err: "Fetching cart fails. " + error.message });
  }
};

exports.saveCartOrder = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  const delfee = req.body.delfee;
  const paymentOption = req.body.paymentOption;
  const delAddress = req.body.delAddress;

  try {
    const user = await User.findOne({ email }).exec();
    if (user) {
      const cart = await Cart.findOne({
        orderedBy: user._id,
        estoreid: Object(estoreid),
      });

      const newOrder = new Order({
        orderCode: cart._id.toString().slice(-12),
        products: cart.products,
        paymentOption: ObjectId(paymentOption),
        cartTotal: cart.cartTotal,
        delfee,
        grandTotal: cart.grandTotal,
        orderedBy: user._id,
        estoreid: ObjectId(estoreid),
        delAddress,
      });

      const order = await newOrder.save();

      if (order) {
        await Cart.deleteMany({
          orderedBy: user._id,
          estoreid: Object(estoreid),
        });
      }
      res.json(order);
    } else {
      res.json({ err: "Cannot fetch the cart details." });
    }
  } catch (error) {
    res.json({ err: "Saving cart to order fails. " + error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  const orderid = req.body.orderid;
  const orderStatus = req.body.orderStatus;

  try {
    const user = await User.findOne({ email }).exec();
    if (user) {
      const order = await Order.findOneAndUpdate(
        {
          _id: ObjectId(orderid),
          orderedBy: ObjectId(user._id),
          estoreid: Object(estoreid),
        },
        {
          orderStatus,
        },
        { new: true }
      );
      res.json(order);
    } else {
      res.json({ err: "Cannot update the order status." });
    }
  } catch (error) {
    res.json({ err: "Updating order status fails. " + error.message });
  }
};

exports.deleteAdminOrder = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const orderid = req.params.orderid;

  try {
    const order = await Order.findOneAndDelete({
      _id: ObjectId(orderid),
      estoreid: Object(estoreid),
    });
    res.json(order);
  } catch (error) {
    res.json({ err: "Deleting order fails. " + error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  const orderid = req.params.orderid;

  try {
    const user = await User.findOne({ email }).exec();
    if (user) {
      const order = await Order.findOneAndDelete({
        _id: ObjectId(orderid),
        orderedBy: user._id,
        estoreid: Object(estoreid),
      });
      res.json(order);
    } else {
      res.json({ err: "Cannot delete the order." });
    }
  } catch (error) {
    res.json({ err: "Deleting order fails. " + error.message });
  }
};

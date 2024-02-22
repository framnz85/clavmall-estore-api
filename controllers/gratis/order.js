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

exports.userOrders = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;

  try {
    const { sortkey, sort, currentPage, pageSize } = req.body;

    const user = await User.findOne({ email }).exec();
    if (user) {
      const orders = await Order.find({
        orderedBy: user._id,
        estoreid: Object(estoreid),
      })
        .skip((currentPage - 1) * pageSize)
        .sort({ [sortkey]: sort })
        .limit(pageSize)
        .populate("products.product")
        .populate("orderedBy")
        .populate("paymentOption")
        .exec();

      const countOrder = await Order.find({
        orderedBy: user._id,
        estoreid: Object(estoreid),
      }).exec();

      res.json({ orders, count: countOrder.length });
    } else {
      res.json({ err: "Cannot fetch user orders." });
    }
  } catch (error) {
    res.json({ err: "Fetching orders failed. " + error.message });
  }
};

exports.adminOrders = async (req, res) => {
  const estoreid = req.headers.estoreid;

  try {
    const { sortkey, sort, currentPage, pageSize } = req.body;

    const orders = await Order.find({
      estoreid: Object(estoreid),
    })
      .skip((currentPage - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize)
      .populate("products.product")
      .populate("orderedBy")
      .populate("paymentOption")
      .exec();

    const countOrder = await Order.find({
      estoreid: Object(estoreid),
    }).exec();

    res.json({ orders, count: countOrder.length });
  } catch (error) {
    res.json({ err: "Fetching orders failed. " + error.message });
  }
};

exports.adminDaySale = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const dates = req.body.dates;

  try {
    const orders = await Order.find({
      estoreid: Object(estoreid),
      orderStatus: "Completed",
      createdAt: {
        $gte: new Date(new Date(dates.dateStart).setHours(0o0, 0o0, 0o0)),
        $lt: new Date(new Date(dates.endDate).setHours(23, 59, 59)),
      },
    }).exec();

    const cartTotal = orders.reduce((accumulator, value) => {
      return accumulator + value.cartTotal;
    }, 0);

    const delfee = orders.reduce((accumulator, value) => {
      return accumulator + value.delfee;
    }, 0);

    res.json({ cartTotal, delfee });
  } catch (error) {
    res.json({ err: "Fetching orders failed. " + error.message });
  }
};

exports.adminDaySaleCapital = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const dates = req.body.dates;
  let capital = 0;

  try {
    const orders = await Order.find({
      estoreid: Object(estoreid),
      orderStatus: "Completed",
      createdAt: {
        $gte: new Date(new Date(dates.dateStart).setHours(0o0, 0o0, 0o0)),
        $lt: new Date(new Date(dates.endDate).setHours(23, 59, 59)),
      },
    })
      .populate("products.product")
      .exec();

    orders.forEach((order) => {
      capital =
        capital +
        order.products.reduce((accumulator, value) => {
          return value.product && value.product.supplierPrice
            ? accumulator + value.product.supplierPrice * value.count
            : 0;
        }, 0);
    });

    res.json({ capital });
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
      let excessQuantity = 0;
      let exceedProdTitle = "";
      for (let i = 0; i < cart.length; i++) {
        let object = {};

        object.product = cart[i]._id;
        object.count = cart[i].count;

        const productFromDb = await Product.findOne({
          _id: ObjectId(cart[i]._id),
          estoreid: ObjectId(estoreid),
        })
          .select("title price quantity segregate")
          .exec();
        object.price = productFromDb.price;
        cart[i] = { ...cart[i], price: productFromDb.price };

        products.push(object);

        if (
          !productFromDb.segregate &&
          (!productFromDb.quantity || productFromDb.quantity < object.count)
        ) {
          excessQuantity = productFromDb.quantity;
          exceedProdTitle = productFromDb.title;
        }
      }
      if (excessQuantity === 0) {
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
        res.json({
          err: exceedProdTitle + " has " + excessQuantity + " in stock only",
        });
      }
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
  const orderType = req.body.orderType;
  const delfee = req.body.delfee;
  const cash = req.body.cash;
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
        orderType,
        products: cart.products,
        paymentOption: ObjectId(paymentOption),
        orderStatus: orderType === "pos" ? "Completed" : "Not Processed",
        cartTotal: cart.cartTotal,
        delfee,
        grandTotal: cart.grandTotal,
        cash,
        orderedBy: user._id,
        estoreid: ObjectId(estoreid),
        delAddress,
      });

      const order = await newOrder.save();

      if (order) {
        res.json(order);
        await Cart.deleteMany({
          orderedBy: user._id,
          estoreid: Object(estoreid),
        });

        if (orderType === "pos" && order.orderStatus === "Completed") {
          order.products.forEach(async (prod) => {
            const result = await Product.findOneAndUpdate(
              {
                _id: ObjectId(prod.product),
                estoreid: Object(estoreid),
              },
              { $inc: { quantity: -prod.count, sold: prod.count } },
              { new: true }
            );
            if (result.quantity < 0) {
              await Product.findOneAndUpdate(
                {
                  _id: ObjectId(prod.product),
                  estoreid: Object(estoreid),
                },
                { quantity: 0 },
                { new: true }
              );
            }
          });
        }
      } else {
        res.json({ err: "Cannot save the order." });
      }
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
  const { orderid, orderStatus, orderPastStat, orderType, orderedBy } =
    req.body;

  try {
    const user = await User.findOne({ email }).exec();
    if (user) {
      const order = await Order.findOneAndUpdate(
        {
          _id: ObjectId(orderid),
          orderedBy: ObjectId(orderedBy),
          estoreid: Object(estoreid),
        },
        {
          orderStatus,
        },
        { new: true }
      );
      if (order) {
        res.json(order);
        if (orderType === "web" && orderStatus === "Delivering") {
          order.products.forEach(async (prod) => {
            const result = await Product.findOneAndUpdate(
              {
                _id: ObjectId(prod.product),
                estoreid: Object(estoreid),
              },
              { $inc: { quantity: -prod.count, sold: prod.count } },
              { new: true }
            );
            if (result.quantity < 0) {
              await Product.findOneAndUpdate(
                {
                  _id: ObjectId(prod.product),
                  estoreid: Object(estoreid),
                },
                { quantity: 0 },
                { new: true }
              );
            }
          });
        }
        if (
          orderType === "web" &&
          orderStatus === "Cancelled" &&
          orderPastStat === "Delivering"
        ) {
          order.products.forEach(async (prod) => {
            await Product.findOneAndUpdate(
              {
                _id: ObjectId(prod.product),
                estoreid: Object(estoreid),
              },
              { $inc: { quantity: prod.count, sold: -prod.count } },
              { new: true }
            );
          });
        }
      } else {
        res.json({ err: "Order does not exist." });
      }
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

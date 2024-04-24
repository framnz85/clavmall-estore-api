const ObjectId = require("mongoose").Types.ObjectId;
const md5 = require("md5");

const User = require("../../models/gratis/user");
const Cart = require("../../models/gratis/cart");
const Product = require("../../models/gratis/product");
const Order = require("../../models/gratis/order");
const Estore = require("../../models/gratis/estore");
const { createRaffle } = require("./common");

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
  const email = req.user.email;
  let orders = [];

  try {
    const { sortkey, sort, currentPage, pageSize } = req.body;
    const user = await User.findOne({ email }).exec();

    if (user.role === "cashier") {
      orders = await Order.find({
        estoreid: Object(estoreid),
        orderedBy: user._id,
      })
        .skip((currentPage - 1) * pageSize)
        .sort({ [sortkey]: sort })
        .limit(pageSize)
        .populate("products.product")
        .populate("orderedBy")
        .populate("paymentOption")
        .exec();
    } else {
      orders = await Order.find({
        estoreid: Object(estoreid),
      })
        .skip((currentPage - 1) * pageSize)
        .sort({ [sortkey]: sort })
        .limit(pageSize)
        .populate("products.product")
        .populate("orderedBy")
        .populate("paymentOption")
        .exec();
    }

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
    }).exec();

    orders.forEach((order) => {
      capital =
        capital +
        order.products.reduce((accumulator, value) => {
          return value.supplierPrice
            ? accumulator + value.supplierPrice * value.count
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
      let remainingQuantity = 0;
      let exceedProdTitle = "";
      for (let i = 0; i < cart.length; i++) {
        let object = {};

        object.product = cart[i]._id;
        object.count = cart[i].count;

        const productFromDb = await Product.findOne({
          _id: ObjectId(cart[i]._id),
          estoreid: ObjectId(estoreid),
        })
          .select("title supplierPrice price wprice wcount quantity segregate")
          .exec();
        object.supplierPrice = productFromDb.supplierPrice;
        let price = 0;
        if (cart[i].priceChange) {
          price = cart[i].price;
        } else {
          if (
            productFromDb.wprice &&
            productFromDb.wprice > 0 &&
            cart[i].count >= productFromDb.wcount
          ) {
            price = productFromDb.wprice;
          } else {
            price = productFromDb.price;
          }
        }
        object.price = price;
        cart[i] = { ...cart[i], price };

        products.push(object);

        remainingQuantity = productFromDb.quantity;

        if (
          !productFromDb.segregate &&
          (!productFromDb.quantity || productFromDb.quantity < object.count)
        ) {
          excessQuantity = productFromDb.quantity;
          exceedProdTitle = productFromDb.title;
        }
      }
      if (excessQuantity === 0 && remainingQuantity > 0) {
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
  const discount = req.body.discount;
  const addDiscount = req.body.addDiscount;
  const cash = req.body.cash;
  const paymentOption = req.body.paymentOption;
  const delAddress = req.body.delAddress;
  const orderNotes = req.body.orderNotes;

  const customerName = req.body.customerName;
  const customerPhone = req.body.customerPhone;
  const customerEmail = req.body.customerEmail;

  try {
    let user = await User.findOne({ email }).exec();
    const origUser = user;

    if (customerName) {
      let checkUser = {};
      if (customerPhone) {
        checkUser = await User.findOne({
          phone: customerPhone,
          estoreid: ObjectId(estoreid),
        });
      }
      if (customerEmail) {
        checkUser = await User.findOne({
          email: customerEmail,
          estoreid: ObjectId(estoreid),
        });
      }
      if (checkUser) {
        user = checkUser;
      } else {
        if (customerPhone || customerEmail) {
          const newUser = new User({
            name: customerName,
            phone: customerPhone ? customerPhone : "09100000001",
            email: customerEmail ? customerEmail : "abc@xyz.com",
            password: md5("Grocery@2000"),
            showPass: "Grocery@2000",
            role: "customer",
            estoreid: ObjectId(estoreid),
          });
          user = await newUser.save();
        }
      }
    }

    if (user) {
      const cart = await Cart.findOne({
        orderedBy: origUser._id,
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
        discount,
        addDiscount,
        cash,
        orderedBy: user._id,
        orderedName: customerName || user.name,
        estoreid: ObjectId(estoreid),
        delAddress,
        orderNotes,
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
            if (result.quantity <= 0) {
              const newQuantity =
                result && result.waiting && result.waiting.newQuantity
                  ? result.waiting.newQuantity
                  : 0;

              const newSupplierPrice =
                result && result.waiting && result.waiting.newSupplierPrice
                  ? result.waiting.newSupplierPrice
                  : result.supplierPrice;

              const newPrice =
                newSupplierPrice + (newSupplierPrice * result.markup) / 100;

              await Product.findOneAndUpdate(
                {
                  _id: ObjectId(prod.product),
                  estoreid: Object(estoreid),
                },
                {
                  quantity: newQuantity,
                  supplierPrice: newSupplierPrice,
                  price: newPrice,
                  waiting: {},
                },
                { new: true }
              );
            }
          });

          const estore = await Estore.findOne({
            _id: ObjectId(estoreid),
          }).exec();

          const date1 = new Date(estore.raffleDate);
          const date2 = new Date();
          const timeDifference = date1.getTime() - date2.getTime();
          const daysDifference = Math.round(
            timeDifference / (1000 * 3600 * 24)
          );

          if (
            user.role === "customer" &&
            estore.raffleActivation &&
            daysDifference > 0
          ) {
            createRaffle(
              estoreid,
              user._id,
              order._id,
              estore.raffleDate,
              estore.raffleEntryAmount,
              order.cartTotal
            );
          }
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
            if (result.quantity <= 0) {
              const newQuantity =
                result && result.waiting && result.waiting.newQuantity
                  ? result.waiting.newQuantity
                  : 0;

              const newSupplierPrice =
                result && result.waiting && result.waiting.newSupplierPrice
                  ? result.waiting.newSupplierPrice
                  : result.supplierPrice;

              const newPrice =
                newSupplierPrice + (newSupplierPrice * result.markup) / 100;

              await Product.findOneAndUpdate(
                {
                  _id: ObjectId(prod.product),
                  estoreid: Object(estoreid),
                },
                {
                  quantity: newQuantity,
                  supplierPrice: newSupplierPrice,
                  price: newPrice,
                  waiting: {},
                },
                { new: true }
              );
            }
          });
        }
        if (orderType === "web" && order.orderStatus === "Completed") {
          const estore = await Estore.findOne({
            _id: ObjectId(estoreid),
          }).exec();

          const date1 = new Date(estore.raffleDate);
          const date2 = new Date();
          const timeDifference = date1.getTime() - date2.getTime();
          const daysDifference = Math.round(
            timeDifference / (1000 * 3600 * 24)
          );

          if (estore.raffleActivation && daysDifference > 0) {
            createRaffle(
              estoreid,
              order.orderedBy,
              order._id,
              estore.raffleDate,
              estore.raffleEntryAmount,
              order.cartTotal
            );
          }
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
    if (
      order.orderStatus === "Delivering" ||
      order.orderStatus === "Completed"
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

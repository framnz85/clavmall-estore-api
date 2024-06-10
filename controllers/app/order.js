const ObjectId = require("mongoose").Types.ObjectId;

const Order = require("../../models/gratis/order");
const User = require("../../models/gratis/user");
const Estore = require("../../models/gratis/estore");
const Product = require("../../models/gratis/product");

exports.getPosOrders = async (req, res) => {
  const estoreid = req.headers.estoreid;

  try {
    const orders = await Order.find({
      estoreid: ObjectId(estoreid),
      orderType: "pos",
    }).exec();

    res.json(orders);
  } catch (error) {
    res.json({ err: "Getting all orders failed." + error.message });
  }
};

exports.saveOrder = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;

  const cartTotal = req.body.cartTotal;
  const discount = req.body.discount;
  const addDiscount = req.body.addDiscount;
  const cash = req.body.cash;
  const orderNotes = req.body.orderNotes;
  const products = req.body.products;

  const orderedBy = req.body.orderedBy;
  const customerName = req.body.customerName;
  const customerPhone = req.body.customerPhone;
  const customerEmail = req.body.customerEmail;

  try {
    let user = await User.findOne({ email }).exec();

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
      if (orderedBy) {
        checkUser = await User.findOne({
          _id: ObjectId(orderedBy),
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
      const newOrder = new Order({
        orderType: "pos",
        orderStatus: "Completed",
        cartTotal,
        discount,
        addDiscount,
        cash,
        orderedBy: user._id,
        orderedName: customerName || user.name,
        estoreid: ObjectId(estoreid),
        orderNotes,
        products,
      });

      const order = await newOrder.save();

      if (order) {
        res.json(order);

        await Order.findByIdAndUpdate(order._id, {
          orderCode: order._id.toString().slice(-12),
        }).exec();

        await Estore.findByIdAndUpdate(estoreid, {
          orderChange: new Date().valueOf(),
          productChange: new Date().valueOf(),
        }).exec();

        if (order.orderType === "pos" && order.orderStatus === "Completed") {
          order.products.forEach(async (prod) => {
            const result = await Product.findOneAndUpdate(
              {
                _id: ObjectId(prod.product),
                estoreid: Object(estoreid),
              },
              { $inc: { quantity: -prod.count, sold: prod.count } },
              { new: true }
            );
            if (result && result.quantity <= 0) {
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

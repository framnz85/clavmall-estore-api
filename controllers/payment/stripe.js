const User = require("../../models/user/user");
const Cart = require("../../models/user/cart");
const MyPayment = require("../../models/payment/myPayment");

exports.cretePaymentIntent = async (req, res) => {
  const estoreid = req.headers.estoreid;
  let stripe = {};
  const email = req.user.email;
  const phone = req.user.phone;
  let user = {};

  const payment = await MyPayment(estoreid)
    .findOne({ name: "Stripe", category: "Credit/Debit Card" })
    .exec();

  if (payment) {
    const secretKey = payment.details.filter((p) => p.desc === "Secret key");
    if (secretKey[0]) {
      stripe = require("stripe")(secretKey[0].value);
    } else {
      res.send({
        err: "Cannot find Stripe details. Contact the administrator.",
      });
    }
  } else {
    res.send({ err: "Cannot find Stripe details. Contact the administrator." });
  }

  if (email) {
    user = await User(estoreid).findOne({ email }).exec();
  } else if (phone) {
    user = await User(estoreid).findOne({ phone }).exec();
  }

  const { _id, cartTotal, grandTotal } = await Cart(estoreid)
    .findOne({
      orderedBy: user._id,
    })
    .exec();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(grandTotal * 100),
    currency: "usd",
    description: "Payment for Order Code: " + _id.toString().slice(-12),
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
    orderCode: _id.toString().slice(-12),
    cartTotal,
    grandTotal,
  });
};

exports.getCartTotals = async (req, res) => {
  let paypal = "";
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  const phone = req.user.phone;
  let user = {};

  const payment = await MyPayment(estoreid)
    .findOne({ name: "Paypal", category: "Credit/Debit Card" })
    .exec();

  if (payment) {
    const id = payment.details.filter((p) => p.desc === "Client ID");
    if (id[0]) {
      paypal = id[0].value;
    } else {
      res.send({
        err: "Cannot find Paypal Client ID. Contact the administrator.",
      });
    }
  } else {
    res.send({
      err: "Cannot find Paypal Client ID. Contact the administrator.",
    });
  }

  if (email) {
    user = await User(estoreid).findOne({ email }).exec();
  } else if (phone) {
    user = await User(estoreid).findOne({ phone }).exec();
  }

  const cart = await Cart(estoreid)
    .findOne({
      orderedBy: user._id,
    })
    .exec();

  if (cart) {
    const { _id, cartTotal, grandTotal } = cart;
    res.send({
      clientId: paypal,
      orderCode: _id.toString().slice(-12),
      cartTotal,
      grandTotal,
    });
  } else {
    res.send({
      clientId: paypal,
    });
  }
};

exports.getSubGrandTotal = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  const phone = req.user.phone;
  let user = {};

  if (email) {
    user = await User(estoreid).findOne({ email }).exec();
  } else if (phone) {
    user = await User(estoreid).findOne({ phone }).exec();
  }

  const { _id, cartTotal, grandTotal } = await Cart(estoreid)
    .findOne({
      orderedBy: user._id,
    })
    .exec();

  res.send({
    orderCode: _id.toString().slice(-12),
    cartTotal,
    grandTotal,
  });
};

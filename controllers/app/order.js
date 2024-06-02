const ObjectId = require("mongoose").Types.ObjectId;

const Order = require("../../models/gratis/order");

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

const Coupon = require("../../models/authority/coupon");

exports.create = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const { name, code, expiry, discount } = req.body.coupon;
    const newCoupon = await Coupon(estoreid).collection.insertOne({
      name,
      code,
      expiry,
      discount,
    });
    res.json(newCoupon);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send("Coupon code already exist.");
    } else {
      res.status(400).send("Create coupon failed.");
    }
  }
};

exports.remove = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    res.json(
      await Coupon(estoreid).findByIdAndDelete(req.params.couponId).exec()
    );
  } catch (error) {
    res.status(400).send("Removing coupon failed.");
  }
};

exports.list = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    res.json(await Coupon(estoreid).find({}).sort({ createdAt: -1 }).exec());
  } catch (error) {
    res.status(400).send("Getting coupon list failed.");
  }
};

exports.update = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const { activate } = req.body;
    res.json(
      await Coupon(estoreid).findOneAndUpdate(
        { _id: req.params.couponId },
        { activate },
        { new: true }
      )
    );
  } catch (error) {
    res.status(400).send("Updating coupon list failed.");
  }
};

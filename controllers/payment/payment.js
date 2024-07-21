const ObjectId = require("mongoose").Types.ObjectId;
const Payment = require("../../models/payment/payment");
const MyPayment = require("../../models/payment/myPayment");

exports.listPayments = async (req, res) => {
  const payments = await Payment.find({}).exec();
  res.json(payments);
};

exports.listMyPayment = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const payment = await MyPayment(estoreid)
    .findOne({ _id: req.params.payid })
    .exec();
  res.json(payment);
};

exports.listMyPayments = async (req, res) => {
  const estoreid = req.headers.estoreid;
  let payments = [];
  const address = req.body.address;

  if (address) {
    const { country = {}, addiv1 = {}, addiv2 = {}, addiv3 = {} } = address;

    payments = await MyPayment(estoreid)
      .aggregate([
        {
          $match: {
            $nor: [
              {
                $and: [
                  {
                    "noAvail.couid": ObjectId(country._id),
                  },
                  {
                    "noAvail.addiv1": ObjectId(addiv1._id),
                  },
                  {
                    "noAvail.addiv2": undefined,
                  },
                  {
                    "noAvail.addiv3": undefined,
                  },
                ],
              },
              {
                $and: [
                  {
                    "noAvail.couid": ObjectId(country._id),
                  },
                  {
                    "noAvail.addiv1": ObjectId(addiv1._id),
                  },
                  {
                    "noAvail.addiv2": ObjectId(addiv2._id),
                  },
                  {
                    "noAvail.addiv3": undefined,
                  },
                ],
              },
              {
                $and: [
                  {
                    "noAvail.couid": ObjectId(country._id),
                  },
                  {
                    "noAvail.addiv1": ObjectId(addiv1._id),
                  },
                  {
                    "noAvail.addiv2": ObjectId(addiv2._id),
                  },
                  {
                    "noAvail.addiv3": ObjectId(addiv3._id),
                  },
                ],
              },
            ],
          },
        },
      ])
      .exec();
  } else {
    payments = await MyPayment(estoreid).find({}).exec();
  }

  res.json(payments);
};

exports.createPayment = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const category = req.body.category;
  try {
    if (category === "Credit/Debit Card") {
      const existPayment = await MyPayment(estoreid)
        .findOne({ category })
        .exec();
      if (existPayment)
        return res
          .status(400)
          .send(
            "Credit/Debit Card should be one of either Stripe or Paypal only. You already have " +
              existPayment.name
          );
    }
    req.body.details = req.body.details.map((det) => {
      return { ...det, _id: ObjectId() };
    });
    req.body.noAvail = [];
    const newPayment = await MyPayment(estoreid).collection.insertOne({
      ...req.body,
      _id: ObjectId(),
    });
    res.json(newPayment);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send("Payment already exist.");
    } else {
      res.status(400).send("Create payment failed.");
    }
  }
};

exports.updatePayment = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const updated = await MyPayment(estoreid).findOneAndUpdate(
      { _id: req.body._id },
      req.body,
      { new: true }
    );
    if (!updated) {
      res.status(404).send("No " + req.params.name + "payment exist");
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(400).send("Updating payment failed.");
  }
};

exports.imageupdate = async (req, res) => {
  const estoreid = req.headers.estoreid;
  await MyPayment(estoreid).findOneAndUpdate(
    { _id: ObjectId(req.params.payid) },
    { images: req.body.images },
    { new: true }
  );
};

exports.deletePayment = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const deleted = await MyPayment(estoreid).findOneAndDelete({
      _id: req.params.payid,
    });
    if (!deleted) {
      res.status(404).send("No payment exist under " + req.params.payid);
      return;
    }
    res.json(deleted);
  } catch (error) {
    res.status(400).send("Payment delete failed.");
  }
};

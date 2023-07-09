const ObjectId = require("mongoose").Types.ObjectId;

const Payment = require("../../models/gratis/payment");

exports.getPayment = async (req, res) => {
  const payid = req.params.payid;
  const estoreid = req.headers.estoreid;
  try {
    const payment = await Payment.findOne({
      _id: ObjectId(payid),
      estoreid: ObjectId(estoreid),
    });
    res.json(payment);
  } catch (error) {
    res.json({ err: "Getting payment fails. " + error.message });
  }
};

exports.getPayments = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const payments = await Payment.find({ estoreid: ObjectId(estoreid) });
    res.json(payments);
  } catch (error) {
    res.json({ err: "Getting payments fails. " + error.message });
  }
};

exports.addPayment = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const paymentCount = await Payment.countDocuments({
      estoreid: ObjectId(estoreid),
    }).exec();

    if (paymentCount < 5) {
      const payment = new Payment({ ...req.body, estoreid });
      await payment.save();
      res.json(payment);
    } else {
      res.json({
        err: `Sorry, you already added 5 payment options on this account. Go to Upgrades to increase your limit.`,
      });
    }
  } catch (error) {
    res.json({ err: "Adding payment fails. " + error.message });
  }
};

exports.updatePayment = async (req, res) => {
  const payid = req.params.payid;
  const estoreid = req.headers.estoreid;
  try {
    const payment = await Payment.findOneAndUpdate(
      {
        _id: ObjectId(payid),
        estoreid: ObjectId(estoreid),
      },
      req.body,
      {
        new: true,
      }
    ).exec();
    res.json(payment);
  } catch (error) {
    res.json({ err: "Updating payment fails. " + error.message });
  }
};

exports.removePayment = async (req, res) => {
  const payid = req.params.payid;
  const estoreid = req.headers.estoreid;
  try {
    const payment = await Payment.findOneAndDelete({
      _id: ObjectId(payid),
      estoreid: ObjectId(estoreid),
    }).exec();
    res.json(payment);
  } catch (error) {
    res.json({ err: "Deleting payment fails. " + error.message });
  }
};

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Ogts = require("../models/ogt");
const Ogpas = require("../models/ogpa");
const md5 = require('md5');

exports.getUser = async (req, res) => {
  const email = req.params.email;
  const password = md5(req.params.password);

  try {
    const user = await Ogts.findOne({ email, password });
    if (user) {
      res.json(user);
    } else {
      res.json({err: "Email or password is incorrect"});
    }
  } catch (error) {
    res.json({err: "Fetching user failed."});
  }
};

exports.getOgpas = async (req, res) => {
  const userid = req.params.userid;

  try {
    const result = await Ogpas.find({ refid: ObjectId(userid), afftype: "non-ogpa" });

    const sumCommission = await Ogpas.aggregate([
      { $match: { refid: ObjectId(userid), afftype: "non-ogpa", commission: { $gte: 0 }, status: "Approved" } },
      { $group: { _id : null, sum : { $sum: "$commission" } } }
    ]).exec();

    const sumWithdraw = await Ogpas.aggregate([
      { $match: { refid: ObjectId(userid), afftype: "non-ogpa", commission: { $lte: 0 } } },
      { $group: { _id : null, sum : { $sum: "$commission" } } }
    ]).exec();

    const totalProducts = await Ogpas.find({ refid: ObjectId(userid), afftype: "non-ogpa", commission: { $gte: 0 }, status: "Approved" }).exec();

    const countAffiliate = await Ogpas.find({}).exec();

    res.json({result, sumCommission, sumWithdraw, totalProducts: totalProducts.length, count: countAffiliate.length});
  } catch (error) {
    res.json({err: "Fetching OGPA Users failed."});
  }
};

exports.createOrUpdateUser = async (req, res) => {
  const email = req.body.email;
  const password = md5(req.body.password);

  try {
    const user = await Ogts.findOne({ email }).exec();
    if (user && user.password) {
      res.json({err: "User under this email is already existing"});
    } else if (user && !user.password) {
      await Ogts.findOneAndUpdate({ email }, { password }, { new: true });
      res.json(user);
    } else {
      const newUser = await new Ogts({...req.body, password}).save();
      res.json(newUser);
    }
  } catch (error) {
    res.json({err: "Create user failed."});
  }
};

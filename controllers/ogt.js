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
    const result1 = await Ogpas.find({ refid: ObjectId(userid), afftype: "non-ogpa" });
    const result2 = await Ogts.find({ refid: ObjectId(userid) });

    const sumCommission = await Ogpas.aggregate([
      { $match: { refid: ObjectId(userid), afftype: "non-ogpa", commission: { $gte: 0 }, status: "active" } },
      { $group: { _id : null, sum : { $sum: "$commission" } } }
    ]).exec();

    const sumWithdraw = await Ogpas.aggregate([
      { $match: { refid: ObjectId(userid), afftype: "non-ogpa", commission: { $lte: 0 } } },
      { $group: { _id : null, sum : { $sum: "$commission" } } }
    ]).exec();

    const totalProducts = await Ogpas.find({ refid: ObjectId(userid), afftype: "non-ogpa", commission: { $gte: 0 }, status: "active" }).exec();

    const countAffiliate = await Ogpas.find({}).exec();

    res.json({result1, result2, sumCommission, sumWithdraw, totalProducts: totalProducts.length, count: countAffiliate.length});
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
    console.log(error)
    res.json({err: "Create user failed."});
  }
};

exports.newOgpa = async (req, res) => {
  try {
    const user = await Ogpas.findOneAndUpdate({ email: req.body.email }, req.body).exec();
    if (user) {
      res.json(req.body);
    } else {
      const newUser = await new Ogpas(req.body).save();
      res.json(newUser);
    }
  } catch (error) {
    res.status(400).send("Adding user failed.");
  }
};

exports.updateUser = async (req, res) => {
  const email = req.body.email;

  try {
    const user = await Ogts.findOneAndUpdate({ email }, req.body, { new: true });
    res.json(user);
  } catch (error) {
    console.log(error)
    res.json({err: "Update user failed."});
  }
};
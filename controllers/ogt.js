const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Ogts = require("../models/ogt");
const Ogpas = require("../models/ogpa");
const Program = require("../models/program");
const Earning = require("../models/earning");
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

exports.getOgts = async (req, res) => {
  const userid = req.params.userid;
  try {
    const result = await Ogts.findOne({ _id: ObjectId(userid) }).populate('programList.progid');
    res.json(result);
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

exports.getPrograms = async (req, res) => {
  try {
    const program = await Program.find();
    res.json(program);
  } catch (error) {
    res.json({err: "Fetching programs failed."});
  }
};

exports.getProgram = async (req, res) => {
  const { slug } = req.params
  try {
    const program = await Program.findOne({slug});
    res.json(program);
  } catch (error) {
    res.json({err: "Fetching programs failed."});
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
    const user = await Ogts.findOneAndUpdate({ email }, req.body, { new: true }).populate('programList.progid');
    res.json(user);
  } catch (error) {
    res.json({err: "Update user failed."});
  }
};

exports.updatePassword = async (req, res) => {
  const email = req.body.email;
  const recovery = req.body.recovery;
  const password = md5(req.body.password);

  try {
    const updateUser = await Ogts.findOneAndUpdate({ email, recovery }, {password}, { new: true }).populate('programList.progid');
    res.json(updateUser);
  } catch (error) {
    res.json({err: "Email or recovery code is not valid."});
  }
};

exports.createEarning = async (req, res) => {
  const owner = ObjectId(req.body.owner);
  const customer = ObjectId(req.body.customer);
  const product = ObjectId(req.body.product);
  const productName = req.body.productName;

  try {
    const result = await Earning.findOne({ owner, customer, product, productName }).exec();

    if (result) {
      res.json({err: "Earnings already exist."});
    } else {
      const earning = await new Earning(req.body).save();
      res.json(earning);
    }
  } catch (error) {
    res.json({err: "Update earning failed."});
  }
};

exports.getEarnings = async (req, res) => {
  const userid = req.params.userid;

  try {
    const result1 = await Earning.find({ owner: ObjectId(userid) }).populate('customer').populate('product');
    const result2 = await Ogts.find({ refid: ObjectId(userid) });

    const sumCommission = await Earning.aggregate([
      { $match: { owner: ObjectId(userid), commission: { $gte: 0 }, status: true } },
      { $group: { _id : null, sum : { $sum: "$commission" } } }
    ]).exec();

    // const sumWithdraw = await Ogpas.aggregate([
    //   { $match: { refid: ObjectId(userid), afftype: "non-ogpa", commission: { $lte: 0 } } },
    //   { $group: { _id : null, sum : { $sum: "$commission" } } }
    // ]).exec();

    const totalProducts = await Earning.find({ owner: ObjectId(userid), commission: { $gte: 0 }, status: true }).exec();

    const countAffiliate = await Earning.find({ owner: ObjectId(userid) }).exec();

    res.json({result1, result2, sumCommission, sumWithdraw : [], totalProducts: totalProducts.length, count: countAffiliate.length});
  } catch (error) {
    res.json({err: "Fetching earning failed."});
  }
};

exports.checkOgtsMcid = async (req, res) => {
  const userid = req.body.userid;
  const mcid = req.body.mcid;
  const email = req.body.email;

  let checkUser = {};

  try {
    if (userid && mcid) {
      const checkMcid = await Ogts.findOne({ mcid }).exec();
      if (checkMcid) {
        res.json({err: "Bonus declined!!! The Facebook Account you use to get the bonus is already being used by other user."});
      } else {
        checkUser = await Ogts.findOneAndUpdate({ _id: ObjectId(userid) }, { mcid, confirmed: true, }).exec();
      }
    } else if (email) {
      checkUser = await Ogts.findOneAndUpdate({ email }, { confirmed: true, }).exec();
    } else {
      res.json({err: "Something is wrong."});
    }

    if (checkUser._id) {
      const checkReward1 = await Earning.findOne({
        owner: ObjectId(checkUser._id),
        customer: ObjectId(checkUser._id),
        productName: "Registration Bonus",
        amount: 100,
        commission: 100,
      }).exec();

      if (checkReward1) {
        res.json({err: "Bonus has already been credited to your account. Check it in your dashboard."});
      } else {
        await new Earning({
            owner: ObjectId(checkUser._id),
            customer: ObjectId(checkUser._id),
            productName: "Registration Bonus",
            amount: 100,
            commission: 100,
            status: true,
        }).save();
        
        const checkReward2 = await Earning.findOne({
          owner: ObjectId(checkUser.refid),
          customer: ObjectId(checkUser._id),
          productName: "Recruitment Reward",
          amount: 1,
          commission: 1,
        }).exec();
        if (!checkReward2) {
          await new Earning({
              owner: ObjectId(checkUser.refid),
              customer: ObjectId(checkUser._id),
              productName: "Recruitment Reward",
              amount: 1,
              commission: 1,
              status: true,
          }).save();
        }
      }
    }
  } catch (error) {
    res.json({err: "Fetching user failed."});
  }
};
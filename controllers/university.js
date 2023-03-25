const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const User = require("../models/university/user");
const Program = require("../models/university/program");
const Earning = require("../models/university/earning");
const md5 = require('md5');

exports.getUser = async (req, res) => {
  const email = req.params.email;
  const password = md5(req.params.password);

  try {
    const user = await User.findOne({ email, password });
    if (user) {
      res.json(user);
    } else {
      res.json({err: "Email or password is incorrect"});
    }
  } catch (error) {
    res.json({err: "Fetching user failed."});
  }
};

exports.getUserById = async (req, res) => {
  const userid = req.params.userid;
  try {
    const result = await User.findOne({ _id: ObjectId(userid) }).populate('programList.progid');
    res.json(result);
  } catch (error) {
    res.json({err: "Fetching user failed."});
  }
};

exports.getProgram = async (req, res) => {
  const { slug } = req.params
  try {
    const program = await Program.findOne({$or: [{slug}, {saleSlug: slug}]});
    res.json(program);
  } catch (error) {
    res.json({err: "Fetching programs failed."});
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

exports.getDashboard = async (req, res) => {
  const userid = req.params.userid;

  try {
    const sumCommission = await Earning.aggregate([
      { $match: { owner: ObjectId(userid), commission: { $gte: 0 }, status: true } },
      { $group: { _id : null, sum : { $sum: "$commission" } } }
    ]).exec();

    const totalProducts = await Earning.find({ owner: ObjectId(userid), commission: { $gte: 0 }, status: true }).exec();

    res.json({sumCommission, sumWithdraw : [], totalProducts: totalProducts.length});
  } catch (error) {
    res.json({err: "Fetching earnings for dashboard failed."});
  }
};

exports.getEarnings = async (req, res) => {
  const userid = req.params.userid;
  const pageSize = req.body.pageSize;
  const current = req.body.current;
  const sortkey = req.body.sortkey;
  const sort = req.body.sort;

  try {
    const earnings = await Earning.find({ owner: ObjectId(userid) })
      .populate('customer')
      .populate('product')
      .skip((current - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize);
    const earningsTotal = await Earning.find({ owner: ObjectId(userid) }).exec();

    res.json({earnings, earningsTotal: earningsTotal.length});
  } catch (error) {
    res.json({err: "Fetching earnings failed."});
  }
};

exports.getReferrals = async (req, res) => {
  const userid = req.params.userid;
  const pageSize = req.body.pageSize;
  const current = req.body.current;
  const sortkey = req.body.sortkey;
  const sort = req.body.sort;

  try {
    const referrals = await User.find({ refid: ObjectId(userid) })
      .skip((current - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize);
    const referralsTotal = await User.find({ refid: ObjectId(userid) }).exec();
    res.json({ referrals, referralsTotal: referralsTotal.length});
  } catch (error) {
    res.json({err: "Fetching earning failed."});
  }
};

exports.getMyPrograms = async (req, res) => {
  const { userid } = req.params
  try {
    const myPrograms = await Program.find({owner: ObjectId(userid)});
    res.json(myPrograms);
  } catch (error) {
    res.json({err: "Fetching programs failed."});
  }
};

exports.createOrUpdateUser = async (req, res) => {
  const email = req.body.email;
  const password = md5(req.body.password);

  try {
    const user = await User.findOne({ email }).exec();
    if (user && user.password) {
      res.json({err: "User under this email is already existing"});
    } else if (user && !user.password) {
      await User.findOneAndUpdate({ email }, { password }, { new: true });
      res.json(user);
    } else {
      const newUser = await new User({...req.body, password}).save();
      res.json(newUser);
    }
  } catch (error) {
    res.json({err: "Create user failed."});
  }
};

exports.updateUser = async (req, res) => {
  const email = req.body.email;

  try {
    const user = await User.findOneAndUpdate({ email }, req.body, { new: true }).populate('programList.progid');
    res.json(user);
  } catch (error) {
    res.json({err: "Update user failed."});
  }
};

exports.updatePassword = async (req, res) => {
  const email = req.body.email;
  const recovery = req.body.recovery;
  const password = req.body.password && md5(req.body.password);

  try {
    const checkEmail = await User.findOne({ email }).exec();
    if (checkEmail) {
      if (recovery && password) {
        const updateUser = await User.findOneAndUpdate({ email, recovery }, { password }, { new: true }).populate('programList.progid');
        if (updateUser) {
          res.json(updateUser);
        } else {
          res.json({err: "Email or recovery code is not valid."});
        }
      } else {
        res.json(checkEmail);
      }
    } else {
      res.json({err: "Email is not yet registered."});
    }
  } catch (error) {
    res.json({err: "Fetching user failed."});
  }
};

exports.updateUsersMcid = async (req, res) => {
  const userid = req.body.userid;
  const mcid = req.body.mcid;
  const email = req.body.email;

  let checkUser = {};

  try {
    if (userid && mcid) {
      const checkMcid = await User.findOne({ mcid }).exec();
      if (checkMcid) {
        res.json({err: "Bonus declined!!! The Facebook Account you use to get the bonus is already being used by other user."});
      } else {
        checkUser = await User.findOneAndUpdate({ _id: ObjectId(userid) }, { mcid, confirmed: true, }).exec();
      }
    } else if (email) {
      checkUser = await User.findOneAndUpdate({ email }, { confirmed: true, }).exec();
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

exports.updateProgram = async (req, res) => {
  const progid = req.params.progid;
  try {
    const updated = await Program.findOneAndUpdate(
      { _id: ObjectId(progid) },
      req.body,
      { new: true }
    );
    if (updated) {
      res.json(updated);
    } else {
      res.json({err: "No program exist under Program ID: " + progid});
    }
  } catch (error) {
    if (error.code === 11000) {
      res.json({err: "Program Slug or Sales Slug is already existing"});
    } else {
      res.json({err: "Updating program failed."});
    }
  }
};
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const User = require("../../models/university/user");
const Earning = require("../../models/university/earning");
const Loginreward = require("../../models/university/loginreward");
const Postreward = require("../../models/university/postreward");

exports.getDashboard = async (req, res) => {
  const userid = req.params.userid;

  try {
    const sumCommission = await Earning.aggregate([
      {
        $match: {
          owner: new ObjectId(userid),
          commission: { $gte: 0 },
          status: true,
        },
      },
      { $group: { _id: null, sum: { $sum: "$commission" } } },
    ]).exec();

    const totalCommission = sumCommission[0] ? sumCommission[0].sum : 0;

    const numberOfEarnings = await Earning.find({
      owner: new ObjectId(userid),
      commission: { $gte: 0 },
      status: true,
    }).exec();

    res.json({
      totalCommission,
      totalWithdraw: 0,
      totalProducts: numberOfEarnings.length,
    });
  } catch (error) {
    res.json({ err: "Fetching earnings for dashboard failed." });
  }
};

exports.getEarnings = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  const pageSize = req.body.pageSize;
  const current = req.body.current;
  const sortkey = req.body.sortkey;
  const sort = req.body.sort;

  try {
    const result = await User.findOne({ email, password });
    if (result) {
      const recruitExist = await Earning.findOne({
        owner: new ObjectId(result._id),
        productName: "Recruitment Reward",
      }).exec();
      const loginExist = await Earning.findOne({
        owner: new ObjectId(result._id),
        productName: "Login Reward",
      }).exec();
      const postExist = await Earning.findOne({
        owner: new ObjectId(result._id),
        productName: "Post Reward",
      }).exec();

      const referrals = await User.aggregate([
        { $match: { refid: new ObjectId(result._id), confirmed: true } },
        { $group: { _id: null, sum: { $sum: "$recruitCommission" } } },
      ]).exec();

      const sumOfRecruitment =
        referrals[0] && referrals[0].sum ? referrals[0].sum : 0;

      if (recruitExist) {
        if (recruitExist.commission !== sumOfRecruitment) {
          await Earning.findOneAndUpdate(
            { _id: new ObjectId(recruitExist._id) },
            {
              amount: sumOfRecruitment,
              commission: sumOfRecruitment,
            },
            { new: true }
          ).exec();
        }
      } else {
        if (sumOfRecruitment > 0) {
          await new Earning({
            owner: new ObjectId(result._id),
            customer: new ObjectId(result._id),
            productName: "Recruitment Reward",
            amount: sumOfRecruitment,
            commission: sumOfRecruitment,
            status: true,
          }).save();
        }
      }

      const loginRewards = await Loginreward.aggregate([
        { $match: { owner: new ObjectId(result._id), status: true } },
        { $group: { _id: null, sum: { $sum: "$commission" } } },
      ]).exec();

      const sumOfLoginRewards =
        loginRewards[0] && loginRewards[0].sum ? loginRewards[0].sum : 0;

      if (loginExist) {
        if (loginExist.commission !== sumOfLoginRewards) {
          await Earning.findOneAndUpdate(
            { _id: new ObjectId(loginExist._id) },
            {
              amount: sumOfLoginRewards,
              commission: sumOfLoginRewards,
            },
            { new: true }
          ).exec();
        }
      } else {
        if (sumOfLoginRewards > 0) {
          await new Earning({
            owner: new ObjectId(result._id),
            customer: new ObjectId(result._id),
            productName: "Login Reward",
            amount: sumOfLoginRewards,
            commission: sumOfLoginRewards,
            status: true,
          }).save();
        }
      }

      const postRewards = await Postreward.aggregate([
        { $match: { owner: new ObjectId(result._id), status: true } },
        { $group: { _id: null, sum: { $sum: "$commission" } } },
      ]).exec();

      const sumOfPostRewards =
        postRewards[0] && postRewards[0].sum ? postRewards[0].sum : 0;

      if (postExist) {
        if (postExist.commission !== sumOfPostRewards) {
          await Earning.findOneAndUpdate(
            { _id: new ObjectId(postExist._id) },
            {
              amount: sumOfPostRewards,
              commission: sumOfPostRewards,
            },
            { new: true }
          ).exec();
        }
      } else {
        if (sumOfPostRewards > 0) {
          await new Earning({
            owner: new ObjectId(result._id),
            customer: new ObjectId(result._id),
            productName: "Post Reward",
            amount: sumOfPostRewards,
            commission: sumOfPostRewards,
            status: true,
          }).save();
        }
      }

      const earnings = await Earning.find({ owner: new ObjectId(result._id) })
        .populate("customer")
        .populate("product")
        .skip((current - 1) * pageSize)
        .sort({ [sortkey]: sort })
        .limit(pageSize);

      const earningsTotal = await Earning.find({
        owner: new ObjectId(result._id),
      }).exec();

      res.json({ earnings, earningsTotal: earningsTotal.length });
    } else {
      res.json({ err: "Error fetching user details." });
    }
  } catch (error) {
    res.json({ err: "Fetching earnings failed." });
  }
};

exports.addUpdateEarning = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  const { program, choosenPackage } = req.body;

  try {
    const result = await User.findOne({ email, password });
    if (result && result.refid && choosenPackage.discountPrice !== "Free") {
      let commission = 0;
      const referral = await User.findOne({ _id: new ObjectId(result.refid) });
      const checkIfEnrolled = referral.programList
        ? referral.programList.filter(
            (prog) => prog.status && prog.progid === program._id
          )
        : [];

      if (checkIfEnrolled.length > 0) {
        commission = parseFloat(choosenPackage.commission3);
      } else if (referral.premium && referral.premium === 2) {
        commission = parseFloat(choosenPackage.commission2);
      } else {
        commission = parseFloat(choosenPackage.commission1);
      }

      const checkReward2 = await Earning.findOne({
        owner: new ObjectId(result.refid),
        customer: new ObjectId(result._id),
        productName: program.title,
      }).exec();

      if (checkReward2) {
        await Earning.findOneAndUpdate(
          { _id: checkReward2._id },
          {
            amount: parseFloat(choosenPackage.discountPrice),
            commission,
          }
        ).exec();
      } else {
        await new Earning({
          owner: new ObjectId(result.refid),
          customer: new ObjectId(result._id),
          productName: program.title,
          amount: parseFloat(choosenPackage.discountPrice),
          commission,
          status: false,
        }).save();
      }
    }
  } catch (error) {
    res.json({ err: "Adding earning failed." });
  }
};

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const User = require("../../models/university/user");
const Earning = require("../../models/university/earning");

exports.getDashboard = async (req, res) => {
  const userid = req.params.userid;

  try {
    const sumCommission = await Earning.aggregate([
      { $match: { owner: ObjectId(userid), commission: { $gte: 0 }, status: true } },
      { $group: { _id : null, sum : { $sum: "$commission" } } }
    ]).exec();

    const totalCommission = sumCommission[0] ? sumCommission[0].sum : 0;

    const numberOfEarnings = await Earning.find({ owner: ObjectId(userid), commission: { $gte: 0 }, status: true }).exec();

    res.json({totalCommission, totalWithdraw : 0, totalProducts: numberOfEarnings.length});
  } catch (error) {
    res.json({err: "Fetching earnings for dashboard failed."});
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
      const recruitExist = await Earning.findOne({ owner: ObjectId(result._id), productName: "Recruitment Reward" }).exec();
      
      const referrals = await User.aggregate([
        { $match: { refid: ObjectId(result._id), confirmed: true } },
        { $group: { _id : null, sum : { $sum: "$recruitCommission" } } }
      ]).exec();

      const sumOfRecruitment = referrals[0] && referrals[0].sum ? referrals[0].sum : 0;

      if (recruitExist) {
        if (recruitExist.commission !== sumOfRecruitment) {
          await Earning.findOneAndUpdate({ _id: ObjectId(recruitExist._id) }, { 
            amount: sumOfRecruitment,
            commission: sumOfRecruitment,
          }, { new: true }).exec();
        }
      } else {
        if (sumOfRecruitment > 0) {
          await new Earning({
              owner: ObjectId(result._id),
              customer: ObjectId(result._id),
              productName: "Recruitment Reward",
              amount: sumOfRecruitment,
              commission: sumOfRecruitment,
              status: true,
          }).save();
        }
      }
      
      const earnings = await Earning.find({ owner: ObjectId(result._id) })
        .populate('customer')
        .populate('product')
        .skip((current - 1) * pageSize)
        .sort({ [sortkey]: sort })
        .limit(pageSize);

      const earningsTotal = await Earning.find({ owner: ObjectId(result._id) }).exec();

      res.json({earnings, earningsTotal: earningsTotal.length});
    } else {
      res.json({err: "Error fetching user details."});
    }
  } catch (error) {
    console.log(error)
    res.json({err: "Fetching earnings failed."});
  }
};

exports.addEarning = async (req, res) => {
    const email = req.user.email;
    const password = req.user.password;
    const program = req.body.program;

    try {
        const result = await User.findOne({ email, password });
        if (result && result.refid && program.discountPrice !== "Free") {
            const checkReward2 = await Earning.findOne({
                owner: ObjectId(result.refid),
                customer: ObjectId(result._id),
                productName: program.title,
                amount: parseFloat(program.discountPrice),
                commission: parseFloat(program.discountPrice),
            }).exec();
            if (!checkReward2) {
                let commission = 0;
                const referral = await User.findOne({ _id: ObjectId(result.refid) });
                const checkIfEnrolled = referral.programList ? referral.programList.filter(
                    prog => prog.status && prog.progid === program._id
                ) : [];

                if (checkIfEnrolled.length > 0) {
                    commission = parseFloat(program.commission3);
                } else if (referral.premium && referral.premium === 2) {
                    commission = parseFloat(program.commission2);
                } else {
                    commission = parseFloat(program.commission1);
                }

                await new Earning({
                    owner: ObjectId(result.refid),
                    customer: ObjectId(result._id),
                    productName: program.title,
                    amount: parseFloat(program.discountPrice),
                    commission,
                    status: false,
                }).save();
            }
        }
    } catch (error) {
        res.json({err: "Adding earning failed."});
    }
};
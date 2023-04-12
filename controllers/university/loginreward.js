const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const Loginreward = require("../../models/university/loginreward");
const User = require("../../models/university/user");

const { loginReward1, loginReward2 } = require("./common");

exports.getLoginRewards = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  const pageSize = req.body.pageSize;
  const current = req.body.current;
  const sortkey = req.body.sortkey;
  const sort = req.body.sort;

  try {
    const result = await User.findOne({ email, password });
    if (result) {
      const loginRewards = await Loginreward.find({ owner: ObjectId(result._id) })
        .skip((current - 1) * pageSize)
        .sort({ confirmed: -1, [sortkey]: sort })
        .limit(pageSize);
      const loginRewardsTotal = await Loginreward.find({ owner: ObjectId(result._id) }).exec();
      res.json({ loginRewards, loginRewardsTotal: loginRewardsTotal.length });
    } else {
      res.json({err: "Error fetching login reward details."});
    }
  } catch (error) {
    res.json({err: "Fetching login rewards failed."});
  }
};

exports.checkLoginToday = async (req, res) => {
  const dateToday = new Date();
  const email = req.user.email;
  const password = req.user.password;

  try {
    const result = await User.findOne({ email, password });
    const loginToday = await Loginreward.findOne({
      owner: ObjectId(result._id),
      rewardDate: dateToday.toDateString()
    }).exec();
    res.json({loginToday});
  } catch (error) {console.log(error)
    res.json({err: "Checking login today failed."});
  }
};

exports.createLoginReward = async (req, res) => {
  const dateToday = new Date();
  const email = req.user.email;
  const password = req.user.password;

  try {
    const result = await User.findOne({ email, password });
    const loginToday = await Loginreward.findOne({
      owner: ObjectId(result._id),
      rewardDate: dateToday.toDateString()
    }).exec();

    if (loginToday) {
      res.json({err: "Login reward for today was already given."});
    } else {
      const reward = await new Loginreward({
        owner: ObjectId(result._id),
        rewardDate: dateToday.toDateString(),
        amount: result.premium && result.premium === 2 ? loginReward2 : loginReward1,
        commission: result.premium && result.premium === 2 ? loginReward2 : loginReward1,
        status: true,
      }).save();
      if (reward) {
        res.json({ reward });
      } else {
        res.json({err: "Creating login reward unsuccessful."});
      }
    }
  } catch (error) {
    res.json({err: "Creating login reward failed."});
  }
};
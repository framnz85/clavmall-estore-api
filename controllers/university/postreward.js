const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const Postreward = require("../../models/university/postreward");
const User = require("../../models/university/user");

const { postReward1, postReward2 } = require("./common");

exports.getPostRewards = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  const pageSize = req.body.pageSize;
  const current = req.body.current;
  const sortkey = req.body.sortkey;
  const sort = req.body.sort;

  try {
    const result = await User.findOne({ email, password });
    if (result) {
      const postRewards = await Postreward.find({ owner: ObjectId(result._id) })
        .skip((current - 1) * pageSize)
        .sort({ confirmed: -1, [sortkey]: sort })
        .limit(pageSize);
      const postRewardsTotal = await Postreward.find({
        owner: ObjectId(result._id),
      }).exec();
      res.json({ postRewards, postRewardsTotal: postRewardsTotal.length });
    } else {
      res.json({ err: "Error fetching post reward details." });
    }
  } catch (error) {
    res.json({ err: "Fetching post rewards failed." });
  }
};

exports.checkPostToday = async (req, res) => {
  const dateToday = new Date();
  const email = req.user.email;
  const password = req.user.password;

  try {
    const result = await User.findOne({ email, password });
    const postToday = await Postreward.findOne({
      owner: ObjectId(result._id),
      rewardDate: dateToday.toDateString(),
    }).exec();
    res.json({ postToday });
  } catch (error) {
    res.json({ err: "Checking post today failed." });
  }
};

exports.createPostReward = async (req, res) => {
  const dateToday = new Date();
  const email = req.user.email;
  const password = req.user.password;
  const promoteLink = req.body.promoteLink;

  try {
    const result = await User.findOne({ email, password });
    const postToday = await Postreward.findOne({
      owner: ObjectId(result._id),
      rewardDate: dateToday.toDateString(),
    }).exec();

    if (postToday) {
      res.json({
        err: "You already submitted a link. Post reward for today was already given.",
      });
    } else {
      const checkExistPost = await Postreward.findOne({
        owner: ObjectId(result._id),
        postLink: promoteLink,
      }).exec();

      if (checkExistPost) {
        res.json({
          err: "The link you have provided has already been submitted. Try another promote post then submit it again here..",
        });
      } else {
        const reward = await new Postreward({
          owner: ObjectId(result._id),
          rewardDate: dateToday.toDateString(),
          postLink: promoteLink,
          amount:
            result.premium && result.premium === 2 ? postReward2 : postReward1,
          commission:
            result.premium && result.premium === 2 ? postReward2 : postReward1,
          status: true,
        }).save();
        if (reward) {
          res.json({ reward });
        } else {
          res.json({ err: "Creating post reward unsuccessful." });
        }
      }
    }
  } catch (error) {
    res.json({ err: "Creating post reward failed." });
  }
};

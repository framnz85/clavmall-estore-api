const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const md5 = require("md5");

const User = require("../../models/university/user");
const Earning = require("../../models/university/earning");
const Faculty = require("../../models/university/faculty");

const { recruitReward1, recruitReward2 } = require("./common");

const facultyId = "641fa5d9ddc99d42e626e3ed";

exports.getUser = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  try {
    const user = await User.findOne({ email, password }).populate(
      "programList.progid",
      "-salesPage"
    );
    const faculty = await Faculty.findOne({ _id: ObjectId(facultyId) });
    if (user) {
      await User.findOneAndUpdate(
        { email, password },
        { multiLogin: faculty.multiLogin },
        { new: true }
      ).exec();
      res.json(user);
    } else {
      res.json({ err: "Email or password is incorrect" });
    }
  } catch (error) {
    res.json({ err: "Fetching user failed." });
  }
};

exports.getUserByToken = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  try {
    const result = await User.findOne({ email, password }).populate(
      "programList.progid",
      "-salesPage"
    );
    const faculty = await Faculty.findOne({ _id: ObjectId(facultyId) });
    if (result.multiLogin !== faculty.multiLogin) {
      res.json({
        login: "You are required to login again due to recent system updates",
      });
    } else {
      await User.findOneAndUpdate(
        { email, password },
        { multiLogin: faculty.multiLogin },
        { new: true }
      ).exec();
      res.json(result);
    }
  } catch (error) {
    res.json({ err: "Email or password is incorrect" });
  }
};

exports.getReferrals = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  const pageSize = req.body.pageSize;
  const current = req.body.current;
  const sortkey = req.body.sortkey;
  const sort = req.body.sort;

  try {
    const result = await User.findOne({ email, password });
    if (result) {
      const referrals = await User.find({ refid: ObjectId(result._id) })
        .skip((current - 1) * pageSize)
        .sort({ confirmed: -1, [sortkey]: sort })
        .limit(pageSize);
      const referralsTotal = await User.find({
        refid: ObjectId(result._id),
      }).exec();
      res.json({ referrals, referralsTotal: referralsTotal.length });
    } else {
      res.json({ err: "Error fetching user details." });
    }
  } catch (error) {
    res.json({ err: "Fetching referrals failed." });
  }
};

exports.createUser = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  try {
    const user = await User.findOne({ email }).exec();
    const faculty = await Faculty.findOne({ _id: ObjectId(facultyId) });
    if (user && user.password) {
      res.json({ err: "User under this email is already existing" });
    } else {
      const newUser = await new User({
        ...req.body,
        email,
        password,
        multiLogin: faculty.multiLogin,
      }).save();
      res.json(newUser);
    }
  } catch (error) {
    res.json({ err: "Create user failed." });
  }
};

exports.updateUser = async (req, res) => {
  const email = req.user.email;
  try {
    const user = await User.findOneAndUpdate({ email }, req.body, {
      new: true,
    }).populate("programList.progid", "-salesPage");
    res.json(user);
  } catch (error) {
    res.json({ err: "Update user failed." });
  }
};

exports.recoverPassword = async (req, res) => {
  const email = req.body.email;
  const recovery = req.body.recovery;
  const password = req.body.password && md5(req.body.password);

  try {
    const checkEmail = await User.findOne({ email }).exec();
    if (checkEmail) {
      if (recovery && password) {
        const updateUser = await User.findOneAndUpdate(
          { email, recovery },
          { password },
          { new: true }
        ).populate("programList.progid", "-salesPage");
        if (updateUser) {
          res.json(updateUser);
        } else {
          res.json({ err: "Email or recovery code is not valid." });
        }
      } else {
        res.json(checkEmail);
      }
    } else {
      res.json({ err: "Email is not yet registered." });
    }
  } catch (error) {
    res.json({ err: "Fetching user failed." });
  }
};

exports.changePassword = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  const oldpassword = md5(req.body.oldpassword);
  const newpassword = md5(req.body.newpassword);

  try {
    if (password === oldpassword) {
      const updateUser = await User.findOneAndUpdate(
        { email, password },
        { password: newpassword },
        { new: true }
      ).populate("programList.progid", "-salesPage");
      if (updateUser) {
        res.json(updateUser);
      } else {
        res.json({ err: "Email or old password is not valid." });
      }
    } else {
      res.json({ err: "Sorry, you have entered incorrect Old Password." });
    }
  } catch (error) {
    res.json({ err: "Fetching user failed." });
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
        res.json({
          err: "Bonus declined!!! The Facebook Account you use to get the bonus is already being used by other user.",
        });
      } else {
        checkUser = await User.findOneAndUpdate(
          { _id: ObjectId(userid) },
          { mcid, confirmed: true }
        ).exec();
      }
    } else if (email) {
      checkUser = await User.findOneAndUpdate(
        { email },
        { confirmed: true }
      ).exec();
    } else {
      res.json({ err: "Something is wrong." });
    }

    if (checkUser._id) {
      const checkReward1 = await Earning.findOne({
        owner: ObjectId(checkUser._id),
        customer: ObjectId(checkUser._id),
        productName: "Registration Bonus",
      }).exec();

      if (checkReward1) {
        res.json({
          err: "Bonus has already been credited to your account. Check it in your dashboard.",
        });
      } else {
        await new Earning({
          owner: ObjectId(checkUser._id),
          customer: ObjectId(checkUser._id),
          productName: "Registration Bonus",
          amount: 750,
          commission: 750,
          status: true,
        }).save();

        const referral = await User.findOne({
          _id: ObjectId(checkUser.refid),
        });
        await User.findOneAndUpdate(
          { _id: ObjectId(checkUser._id) },
          {
            recruitCommission:
              referral.premium && referral.premium === 2
                ? recruitReward2
                : recruitReward1,
          }
        ).exec();
      }
    }
  } catch (error) {
    res.json({ err: "Fetching user failed." });
  }
};

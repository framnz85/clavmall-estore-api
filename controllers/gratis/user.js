const ObjectId = require("mongoose").Types.ObjectId;
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const User = require("../../models/gratis/user");
const Estore = require("../../models/gratis/estore");
const Raffle = require("../../models/gratis/raffle");

const { populateRaffle } = require("./common");

exports.getUserDetails = async (req, res) => {
  const email = req.user.email;
  const estoreid = req.headers.estoreid;
  const resellid = req.params.resellid;

  try {
    const user = await User.findOne({
      email,
      estoreid: ObjectId(estoreid),
      resellid: ObjectId(resellid),
    })
      .populate({
        path: "estoreid",
        populate: {
          path: "country",
        },
      })
      .select("-password -showPass -verifyCode")
      .exec();
    if (user) {
      res.json(user);
    } else {
      const userWithReseller = await User.findOne({
        email,
        resellid: ObjectId(resellid),
      })
        .populate({
          path: "estoreid",
          populate: {
            path: "country",
          },
        })
        .select("-password -showPass -verifyCode")
        .exec();
      if (userWithReseller) {
        res.json(userWithReseller);
      } else {
        const userWithEmail = await User.findOne({
          email,
          estoreid: ObjectId(estoreid),
        })
          .populate({
            path: "estoreid",
            populate: {
              path: "country",
            },
          })
          .select("-password -showPass -verifyCode")
          .exec();
        if (userWithEmail) {
          res.json(userWithEmail);
        } else {
          res.json({
            err: "Cannot fetch the user details or the user doesn't exist in this store.",
          });
        }
      }
    }
  } catch (error) {
    res.json({ err: "Fetching user information fails. " + error.message });
  }
};

exports.getRaffleEntries = async (req, res) => {
  const email = req.user.email;
  const estoreid = req.headers.estoreid;

  try {
    const user = await User.findOne({
      email,
      estoreid: ObjectId(estoreid),
    }).exec();
    const raffles = await Raffle.find({
      owner: user._id,
      estoreid: ObjectId(estoreid),
    })
      .populate("orderid")
      .exec();
    res.json(raffles);
  } catch (error) {
    res.json({ err: "Fetching raffle entries fails. " + error.message });
  }
};

exports.getTopEntries = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const count = req.params.count;

  try {
    let entries = await Raffle.aggregate([
      { $match: { estoreid: ObjectId(estoreid) } },
      { $sample: { size: parseInt(count) } },
    ]).exec();
    entries = await populateRaffle(entries);
    res.json(entries);
  } catch (error) {
    res.json({ err: "Fetching top raffle entries fails. " + error.message });
  }
};

exports.getAffiliates = async (req, res) => {
  const email = req.user.email;
  const estoreid = req.headers.estoreid;

  try {
    const user = await User.findOne({
      email,
      estoreid: ObjectId(estoreid),
    }).exec();
    const affiliates = await User.find({
      refid: ObjectId(user._id),
    }).exec();
    res.json(affiliates);
  } catch (error) {
    res.json({ err: "Fetching top raffle entries fails. " + error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  const estoreid = req.headers.estoreid;

  try {
    const { sortkey, sort, currentPage, pageSize, searchQuery } = req.body;

    let searchObj = searchQuery
      ? { $text: { $search: searchQuery }, estoreid: ObjectId(estoreid) }
      : { estoreid: ObjectId(estoreid) };

    const admins = await User.find({
      estoreid: ObjectId(estoreid),
      role: "admin",
    }).exec();
    const moderators = await User.find({
      estoreid: ObjectId(estoreid),
      role: "moderator",
    }).exec();
    const cashiers = await User.find({
      estoreid: ObjectId(estoreid),
      role: "cashier",
    }).exec();

    let customers = await User.find({
      ...searchObj,
      role: "customer",
    })
      .skip((currentPage - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize)
      .exec();

    if (customers.length < 1 && searchQuery) {
      customers = await User.find({
        name: { $regex: searchQuery, $options: "i" },
        estoreid: ObjectId(estoreid),
      })
        .skip((currentPage - 1) * pageSize)
        .sort({ [sortkey]: sort })
        .limit(pageSize)
        .exec();
    }

    const countCustomers = await User.find({
      ...searchObj,
      role: "customer",
    }).exec();

    res.json({
      admins,
      moderators,
      cashiers,
      customers,
      count: countCustomers.length,
    });
  } catch (error) {
    res.json({ err: "Fetching users fails. " + error.message });
  }
};

exports.createNewUser = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const resellid = req.params.resellid;

  try {
    const user = new User(
      req.body.refid
        ? {
            refid: ObjectId(req.body.refid),
            name: req.body.owner,
            phone: req.body.phone,
            email: req.body.email,
            password: md5(req.body.password),
            showPass: req.body.password,
            role: req.body.role,
            estoreid: ObjectId(estoreid),
            resellid: ObjectId(resellid),
          }
        : {
            name: req.body.owner,
            phone: req.body.phone,
            email: req.body.email,
            password: md5(req.body.password),
            showPass: req.body.password,
            role: req.body.role,
            estoreid: ObjectId(estoreid),
            resellid: ObjectId(resellid),
          }
    );
    await user.save();
    const token = jwt.sign(
      { email: req.body.email },
      process.env.JWT_PRIVATE_KEY
    );
    res.json({ user, token });
  } catch (error) {
    if (error.code === 11000) {
      res.json({
        err: `The email ${req.body.email} or phone ${req.body.phone} is already existing`,
      });
    } else {
      res.json({ err: "Creating new user fails. " + error.message });
    }
  }
};

exports.getResellerUsers = async (req, res) => {
  const resellid = req.params.resellid;

  try {
    const { sortkey, sort, currentPage, pageSize, searchQuery, masterUser } =
      req.body;

    let searchObj = searchQuery
      ? masterUser
        ? {
            $text: { $search: searchQuery },
            role: "admin",
          }
        : {
            $text: { $search: searchQuery },
            role: "admin",
            resellid: ObjectId(resellid),
          }
      : masterUser
      ? { role: "admin" }
      : { role: "admin", resellid: ObjectId(resellid) };

    let owners = await User.find(searchObj)
      .populate("estoreid")
      .skip((currentPage - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize)
      .exec();

    let countOwners = {};

    if (owners.length === 0 && searchQuery) {
      owners = await User.find(
        masterUser
          ? {
              email: searchQuery,
              role: "admin",
            }
          : {
              email: searchQuery,
              role: "admin",
              resellid: ObjectId(resellid),
            }
      )
        .populate("estoreid")
        .skip((currentPage - 1) * pageSize)
        .sort({ [sortkey]: sort })
        .limit(pageSize)
        .exec();
      countOwners = await User.find(
        masterUser
          ? {
              email: searchQuery,
              role: "admin",
            }
          : {
              email: searchQuery,
              role: "admin",
              resellid: ObjectId(resellid),
            }
      ).exec();
    } else {
      countOwners = await User.find(searchObj).exec();
    }

    res.json({ owners, count: countOwners.length });
  } catch (error) {
    res.json({ err: "Fetching users fails. " + error.message });
  }
};

exports.sendEmail = async (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const templateId = req.body.templateId;
  const defaultClient = SibApiV3Sdk.ApiClient.instance;

  let apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_APIKEY;

  let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

  sendSmtpEmail = {
    to: [
      {
        email,
        name,
      },
    ],
    templateId,
    headers: {
      "X-Mailin-custom":
        "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
    },
  };

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      res.json({ ok: true });
    },
    function (error) {
      res.json({ err: "Sending welcome email fails. " + error.message });
    }
  );
};

exports.updateUser = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  let objValues = req.body;

  if (email !== req.body.email) {
    objValues = { ...req.body, emailConfirm: false };
  }

  try {
    const checkUser = await User.findOne({
      email,
      estoreid: ObjectId(estoreid),
    });
    if (checkUser.verifyCode && checkUser.verifyCode.length > 0) {
      objValues = { ...req.body, verifyCode: checkUser.verifyCode };
    }
    const user = await User.findOneAndUpdate(
      { email, estoreid: ObjectId(estoreid) },
      objValues,
      {
        new: true,
      }
    )
      .populate({
        path: "estoreid",
        populate: {
          path: "country",
        },
      })
      .select("-password -showPass");
    res.json(user);
  } catch (error) {
    res.json({ err: "Creating new user fails. " + error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const userid = req.params.userid;

  try {
    await User.findOneAndUpdate(
      { _id: ObjectId(userid), estoreid: ObjectId(estoreid) },
      req.body,
      {
        new: true,
      }
    );

    res.json({ ok: true });
  } catch (error) {
    res.json({ err: "Creating new user fails. " + error.message });
  }
};

exports.verifyUserEmail = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  const code = req.body.code;

  try {
    const user = await User.findOneAndUpdate(
      { email, estoreid: ObjectId(estoreid), verifyCode: code },
      { verifyCode: "", emailConfirm: true },
      {
        new: true,
      }
    )
      .populate({
        path: "estoreid",
        populate: {
          path: "country",
        },
      })
      .select("-password -showPass -verifyCode");
    if (user) {
      if (user.role === "admin") {
        await Estore.findOneAndUpdate(
          { _id: ObjectId(estoreid) },
          { status: "active" },
          {
            new: true,
          }
        );
      }
      res.json(user);
    } else {
      res.json({
        err: "Sorry, the verification code you submitted is either incorrect or expired!",
      });
    }
  } catch (error) {
    res.json({ err: "Creating new user fails. " + error.message });
  }
};

exports.changePassword = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  const oldpassword = req.body.oldpassword;
  const newpassword = req.body.newpassword;

  try {
    const user = await User.findOneAndUpdate(
      {
        email,
        estoreid: ObjectId(estoreid),
        password: md5(oldpassword),
      },
      {
        password: md5(newpassword),
      },
      { new: true }
    );
    if (user) {
      res.json(user);
    } else {
      res.json({ err: "The old password you have entered is not correct" });
    }
  } catch (error) {
    res.json({ err: "Deleting user fails. " + error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const userid = req.params.userid;

  try {
    const user = await User.findOneAndUpdate(
      {
        _id: ObjectId(userid),
        estoreid: ObjectId(estoreid),
      },
      {
        password: md5("Grocery@2000"),
      },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.json({ err: "Reseting password for a user fails. " + error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.body.email;
  const newpassword = req.body.newpassword;
  let user = {};

  try {
    if (estoreid) {
      user = await User.findOneAndUpdate(
        {
          email,
          estoreid: ObjectId(estoreid),
        },
        {
          password: md5(newpassword),
        },
        { new: true }
      );
    } else {
      user = await User.findOneAndUpdate(
        {
          email,
          role: "admin",
        },
        {
          password: md5(newpassword),
        },
        { new: true }
      );
    }
    if (user._id) {
      res.json(user);
    } else {
      res.json({ err: "Change user password fails. No user was found" });
    }
  } catch (error) {
    res.json({ err: "Change user password fails. " + error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const userid = req.params.userid;

  try {
    const user = await User.findOneAndDelete({
      _id: ObjectId(userid),
      estoreid: ObjectId(estoreid),
    });
    res.json(user);
  } catch (error) {
    res.json({ err: "Deleting user fails. " + error.message });
  }
};

exports.deleteAllRaffles = async (req, res) => {
  const estoreid = req.headers.estoreid;

  try {
    const raffles = await Raffle.remove({
      estoreid: ObjectId(estoreid),
    });
    res.json(raffles);
  } catch (error) {
    res.json({ err: "Deleting all raffles fails. " + error.message });
  }
};

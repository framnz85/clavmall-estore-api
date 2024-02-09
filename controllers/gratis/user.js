const ObjectId = require("mongoose").Types.ObjectId;
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const User = require("../../models/gratis/user");
const Estore = require("../../models/gratis/estore");
const Notification = require("../../models/authority/notification");

const { sendPushNotification } = require("../../notification/webpush");

exports.getAllUsers = async (req, res) => {
  const estoreid = req.headers.estoreid;

  try {
    const users = await User.find({ estoreid: ObjectId(estoreid) }).exec();
    res.json(users);
  } catch (error) {
    res.json({ err: "Fetching users fails. " + error.message });
  }
};

exports.getUserDetails = async (req, res) => {
  const email = req.user.email;
  const estoreid = req.headers.estoreid;

  try {
    const user = await User.findOne({ email, estoreid: ObjectId(estoreid) })
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
      const userWithEmail = await User.findOne({
        email,
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
  } catch (error) {
    res.json({ err: "Fetching user information fails. " + error.message });
  }
};

exports.createNewUser = async (req, res) => {
  const estoreid = req.headers.estoreid;

  try {
    const user = new User(
      req.body.refid
        ? {
            refid: ObjectId(req.body.refid),
            name: req.body.owner,
            email: req.body.email,
            password: md5(req.body.password),
            showPass: req.body.password,
            role: req.body.role,
            estoreid: ObjectId(estoreid),
          }
        : {
            name: req.body.owner,
            email: req.body.email,
            password: md5(req.body.password),
            showPass: req.body.password,
            role: req.body.role,
            estoreid: ObjectId(estoreid),
          }
    );
    await user.save();
    const token = jwt.sign(
      { email: req.body.email },
      process.env.JWT_PRIVATE_KEY
    );
    res.json({ user, token });
  } catch (error) {
    res.json({ err: "Creating new user fails. " + error.message });
  }
};

exports.sendEmail = async (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
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
    templateId: 179,
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
      res.json({ err: "Recovering user fails. No user was found" });
    }
  } catch (error) {
    res.json({ err: "Deleting user fails. " + error.message });
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

exports.userEndPoint = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  const endPoint = req.body.endPoint;

  try {
    const user = await User.findOneAndUpdate(
      { email, estoreid: ObjectId(estoreid) },
      { endPoint },
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
      const dataText = await Notification.findOne({ type: "intro" }).exec();
      endPoint.forEach((endP) => {
        sendPushNotification(JSON.parse(endP), dataText);
      });

      res.json(user);
    }
  } catch (error) {
    res.json({ err: "Creating new user fails. " + error.message });
  }
};

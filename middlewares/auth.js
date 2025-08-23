const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../models/user/user");
const GratisUser = require("../models/gratis/user");
const jwt_decode = require("jwt-decode");

exports.authCheck = async (req, res, next) => {
  try {
    const jwtDecode = jwt_decode(req.headers.authtoken);
    req.user = jwtDecode;
    next();
  } catch (error) {
    res.status(401).json({
      err: "Invalid or expired token",
    });
  }
};

exports.adminCheck = async (req, res, next) => {
  const { email, phone } = req.user;
  const estoreid = req.headers.estoreid;
  let adminUser = {};

  if (email) {
    adminUser = await User(estoreid).findOne({ email }).exec();
  } else if (phone) {
    adminUser = await User(estoreid).findOne({ phone }).exec();
  }

  if (adminUser.role !== "admin") {
    res.status(403).json({
      error: "Admin resource. Access denied.",
    });
  } else {
    next();
  }
};

exports.adminGratisCheck = async (req, res, next) => {
  const { email } = req.user;
  const estoreid = req.headers.estoreid;

  const adminUser = await GratisUser.findOne({
    email,
    estoreid: new ObjectId(estoreid),
  }).exec();

  if (["admin", "moderator", "cashier"].includes(adminUser.role)) {
    next();
  } else {
    res.status(403).json({
      error: "Admin resource. Access denied.",
    });
  }
};

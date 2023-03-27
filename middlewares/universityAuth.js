const UniUser = require("../models/university/user");
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
const md5 = require('md5');

exports.generateAuthToken = async (req, res) => {
  const email = req.params.email;
  const password = req.params.password;

  try {
    res.json(jwt.sign({ email, password: md5(password) }, process.env.JWT_PRIVATE_KEY));
  } catch (error) {
    res.json({err: `Unable to generate token. ${error.message}`});
  }
};

exports.uniRegAuthCheck = async (req, res, next) => {
  try {
    const jwtDecode = jwt_decode(req.headers.authtoken);
    const user = await UniUser.findOne({ email: jwtDecode.email }).exec();
    if (user) {
      res.json({ err: "Token email already exist. Use another email." });
    } else {
      req.user = jwtDecode;
      next();
    }
  } catch (error) {
    res.json({ err: "Invalid or expired token" });
  }
};

exports.uniLogAuthCheck = async (req, res, next) => {
  try {
    const jwtDecode = jwt_decode(req.headers.authtoken);
    const user = await UniUser.findOne({ email: jwtDecode.email }).exec();
    if (user) {
      req.user = jwtDecode;
      next();
    } else {
      res.json({ register: "Email Address does not exist. Register to create a new account." });
    }
  } catch (error) {
    res.json({ err: "Invalid or expired token" });
  }
};

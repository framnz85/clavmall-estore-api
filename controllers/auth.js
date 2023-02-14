const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const User = require("../models/user");
const { populateWishlist, populateProduct } = require("./common");
const jwt = require('jsonwebtoken');
const md5 = require('md5');

exports.createOrUpdateUser = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const values = req.body.values;
  const { email, phone, password } = req.user;
  let combineUser = { ...req.user, ...values };
  let user = {};
  let newUser = {};
  
  // const superAdminUser = await User(estoreid).findOne({ superAdmin: true });
  if (combineUser.refid) {
    combineUser = { ...combineUser, refid: ObjectId(combineUser.refid) };
  }

  try {
    if (!email) {
      delete combineUser.email;
    } else if (!phone) {
      delete combineUser.phone;
    }
    if (email) {
      user = await User(estoreid).findOneAndUpdate({ email }, combineUser, { new: true });
    } else if (phone) {
      user = await User(estoreid).findOneAndUpdate({ phone }, combineUser, { new: true });
    }

    if (user) {
      res.json(user);
    } else {
      await User(estoreid).collection.insertOne({
        ...combineUser,
        emailConfirm: false,
        password: password ? password : md5("Grocery@1234"),
        role: "customer",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      });
      if (email) {
        newUser = await User(estoreid).findOne({ email }, "_id").exec();
      } else if (phone) {
        newUser = await User(estoreid).findOne({ phone }, "_id").exec();
      }
      res.json({
        ...combineUser,
        _id: newUser._id,
        emailConfirm: false,
        role: "customer",
        address: {},
        homeAddress: {},
        wishlist: [],
      });
    }
  } catch (error) {
    res.json({err: `Create user failed. ${error.message}`});
  }
};

exports.currentUser = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  const phone = req.user.phone;
  let user = {};

  try {
    if (email) {
      user = await User(estoreid).findOne({ email })
    } else if (phone) {
      user = await User(estoreid).findOne({ phone })
    }
    if (user) {
      if (user.wishlist) {
        let wishlist = await populateWishlist(user.wishlist, estoreid);
        wishlist = await populateProduct(wishlist, estoreid);
        user = { ...(user._doc ? user._doc : user) , wishlist }
      }
      res.json(user);
    } else {
      res.json({err: "Email or phone is incorrect"});
    }
  } catch (error) {
    res.json({err: `Fetching user failed. ${error.message}`});
  }
};

exports.defaultPassword = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const { userid } = req.body;
    const updated = await User(estoreid).findOneAndUpdate(
      { _id: Object(userid) },
      { password: md5('grocery') },
      { new: true }
    );
    if (!updated) {
      res.status(404).send("No user exist under userid " + userid);
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(400).send("Update user failed.");
  }
};

exports.updateRole = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const { userid, role } = req.body;
    const updated = await User(estoreid).findOneAndUpdate(
      { _id: Object(userid) },
      { role },
      { new: true }
    );
    if (!updated) {
      res.status(404).send("No user exist under userid " + userid);
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(400).send("Update user failed.");
  }
};

exports.removeUser = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const deleted = await User(estoreid).findOneAndDelete({ _id: ObjectId(req.params.userid) });
    if (!deleted) {
      res.status(404).send(`No user exist`);
      return;
    }
    res.json(deleted);
  } catch (error) {
    res.status(400).send("User delete failed.");
  }
};

exports.updateEmailAddress = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { oldEmail } = req.body;
  const { phone, password } = req.user;
  let user = {};

  try {
    if (oldEmail) {
      user = await User(estoreid).findOneAndUpdate({ email: oldEmail, password }, {
        email: req.user.email,
        emailConfirm: false
      }, { new: true });
    } else if (phone) {
      user = await User(estoreid).findOneAndUpdate({ phone, password }, {
        email: req.user.email,
        emailConfirm: false
      }, { new: true });
    }
    if (user) {
      res.json(user);
    } else {
      res.json({err: "Password is incorrect"});
    }
  } catch (error) {
    es.json({err: `Fetching user failed. ${error.message}`});
  }
};

exports.updateUserPassword = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User(estoreid).findOneAndUpdate(
      { email: req.user.email, password: md5(oldPassword) },
      { password: md5(newPassword) },
      { new: true }
    );
    if (user) {
      res.json(user);
    } else {
      res.json({err: "Current password entered is incorrect"});
    }
  } catch (error) {
    es.json({err: `Fetching user failed. ${error.message}`});
  }
};

exports.generateAuthToken = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.body.user.email;
  const phone = req.body.user.phone;
  const password = req.body.user.password;
  const token = password
    ? jwt.sign({...req.body.user, password: md5(password)}, process.env.JWT_PRIVATE_KEY)
    : jwt.sign(req.body.user, process.env.JWT_PRIVATE_KEY);
  let user = {}

  try {
    if (email) {
      const emailExist = await User(estoreid).findOne({ email });
  
      if (emailExist) {
        if (password) {
          user = await User(estoreid).findOne({ email, password: md5(password) });
        } else {
          user = emailExist;
        }
        if (user) {
          res.json(token);
        } else {
          if (emailExist.password) {
            res.json({err: `User with ${email} is already existing but your password is incorrect`});
          } else {
            res.json(token);
          }
        }
      } else {
        res.json(token);
      }
    } else if (phone) {
      const phoneExist = await User(estoreid).findOne({ phone });
  
      if (phoneExist) {
        if (password) {
          user = await User(estoreid).findOne({ phone, password: md5(password) });
        } else {
          user = phoneExist;
        }
        if (user) {
          res.json(token);
        } else {
          if (phoneExist.password) {
            res.json({err: `User with ${phone} is already existing but your password is incorrect`});
          } else {
            res.json(token);
          }
        }
      } else {
        res.json(token);
      }
    }
  } catch (error) {
    res.json({err: `Unable to generate token. ${error.message}`});
  }
};

exports.existUserAuthToken = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.body.email;
  const phone = req.body.phone;
  const password = req.body.password;
  let user = {};

  try {
    if (email) {
      user = await User(estoreid).findOne({ email });
      if (user) {
        if (password && password === "forgotpassword") {
          const token = jwt.sign({ email }, process.env.JWT_PRIVATE_KEY);
          res.json(token);
          return;
        }
        if (user.password) {
          if (user.password === md5(password)){
            const token = jwt.sign({email, phone, password: md5(password)}, process.env.JWT_PRIVATE_KEY);
            res.json(token);
          } else {
            res.json({err: "Password is incorrect"});
          }
        } else {
          res.json({noPass: `Email is existing but no password was set. You need to register first using the email ${email}`})
        }
      } else {
        res.json({err: "Email does not exist"});
      }
    } else if (phone) {
      user = await User(estoreid).findOne({ phone });
      if (user) {
        if (user.password) {
          if (user.password === md5(password)) {
            const token = jwt.sign({ email, phone, password: md5(password) }, process.env.JWT_PRIVATE_KEY);
            res.json(token);
          } else {
            res.json({err: "Password is incorrect"});
          }
        } else {
          res.json({noPass: `Phone is existing but no password was set. You need to register first using the number ${phone}.`})
        }
      } else {
        res.json({err: "Phone or password is incorrect"});
      }
    }
  } catch (error) {
    res.json({err: `Unable to generate token. ${error.message}`});
  }
};

exports.loginAsAuthToken = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.body.email;
  const phone = req.body.phone;
  let user = {};

  try {
    if (email) {
      user = await User(estoreid).findOne({ email });
    } else if (phone) {
      user = await User(estoreid).findOne({ phone });
    }

    if (user) {
      const token = jwt.sign({email, phone, password: user.password}, process.env.JWT_PRIVATE_KEY);
      res.json(token);
    } else {
      res.json({err: "Email or phone is incorrect"});
    }
  } catch (error) {
    res.json({err: `Unable to generate token. ${error.message}`});
  }
};
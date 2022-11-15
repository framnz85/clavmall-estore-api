const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const User = require("../models/user");
const { populateWishlist, populateProduct } = require("./common");
const jwt = require('jsonwebtoken');
const md5 = require('md5');

exports.createOrUpdateUser = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { name, picture, email, password } = req.user;
  const newAddress = req.body.address;
  const { name: newName, phone, emailConfirm } = req.body.namePhone ? req.body.namePhone : {};

  const finalName = name ? name : newName;

  try {
    const withAddress = phone
      ? finalName ? { name: finalName, phone, picture, address: newAddress, emailConfirm }
        : { phone, picture, address: newAddress, emailConfirm }
      : finalName ? { name: finalName, picture, address: newAddress, emailConfirm }
        : { picture, address: newAddress, emailConfirm };
    const noAddress = phone
      ? finalName ? { name: finalName, phone, picture, emailConfirm }
        :{ phone, picture, emailConfirm }
      : finalName ? { name: finalName, picture, emailConfirm }
        : { picture, emailConfirm };

    const user = await User(estoreid).findOneAndUpdate(
      { email },
      newAddress ? withAddress : noAddress,
      { new: true }
    );

    if (user) {
      res.json(user);
    } else {
      await User(estoreid).collection.insertOne({
        email,
        name: finalName,
        emailConfirm: false,
        password: md5(password),
        phone,
        picture,
        role: "customer",
        address: {},
        homeAddress: {},
        wishlist: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      });
      const newUser = await User(estoreid).findOne({ email }, "_id").exec();
      res.json({
        _id: newUser._id,
        email,
        name: finalName,
        emailConfirm,
        phone,
        picture,
        role: "customer",
        address: {},
        homeAddress: {},
        wishlist: []
      });
    }
  } catch (error) {
    res.status(400).send("Create user failed.");
  }
};

exports.currentUser = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    User(estoreid).findOne({ email: req.user.email })
      .exec(async (err, user) => {
        if (err) throw new Error(err);
        let wishlist = await populateWishlist(user.wishlist, estoreid);
        wishlist = await populateProduct(wishlist, estoreid);
        user = { ...(user._doc ? user._doc : user) , wishlist }
        res.json(user);
      });
  } catch (error) {
    res.status(400).send("Fetching user failed.");
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
  try {
    const user = await User(estoreid).findOneAndUpdate({
      email: oldEmail
    }, {
      email: req.user.email
    }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(400).send("Fetching user failed.");
  }
};

exports.generateAuthToken = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.body.user.email;
  const password = req.body.user.password;

  try {
    const token = jwt.sign(req.body.user, process.env.JWT_PRIVATE_KEY);
    const emailExist = await User(estoreid).findOne({ email});

    if (emailExist) {
      const user = await User(estoreid).findOne({ email, password: md5(password) });
      if (user) {
        res.json(token);
      } else {
        res.json({err: `User with ${email} is already existing but your password is incorrect`});
      }
    } else {
      res.json(token);
    }
  } catch (error) {
    res.status(400).send("Unable to generate token.");
  }
};

exports.existUserAuthToken = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User(estoreid).findOne({ email, password: md5(password) });

    if (user) {
      const token = jwt.sign({email, password: md5(password)}, process.env.JWT_PRIVATE_KEY);
      res.json(token);
    } else {
      res.json({err: "Email or password is incorrect"});
    }
  } catch (error) {
    res.status(400).send("Unable to generate token.");
  }
};

exports.loginAsAuthToken = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User(estoreid).findOne({ email, password });

    if (user) {
      const token = jwt.sign({email, password}, process.env.JWT_PRIVATE_KEY);
      res.json(token);
    } else {
      res.json({err: "Email or password is incorrect"});
    }
  } catch (error) {
    res.status(400).send("Unable to generate token.");
  }
};
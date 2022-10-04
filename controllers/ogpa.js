const Ogpadet = require("../models/ogpadet");
const Ogpas = require("../models/ogpa");

exports.getOgpa = async (req, res) => {
  const ogpaId = "62e881f29d4bfbb9acd1d260";

  try {
    const ogpa = await Ogpadet.findOne({ _id: ogpaId });
    if (ogpa) {
      res.json(ogpa);
    } else {
      res.json({err: "No OGPA amount was fetch"});
    }
  } catch (error) {
    res.status(400).send("Fetching user failed.");
  }
};

exports.getOgpaEmail = async (req, res) => {
  try {
    const user = await Ogpas.findOne({
      email: req.params.email,
    }, "_id name email amount mobile payment").exec();
    if (user) {
      res.json(user);
    } else {
      res.json({err: "Email or Password is incorrect"});
    }
  } catch (error) {
    res.status(400).send("Adding user failed.");
  }
};

exports.existOgpa = async (req, res) => {
  try {
    const user = await Ogpas.findOne({
      email: req.params.email,
      md5pass: req.params.password,
    }, "_id name dateStart");
    if (user) {
      res.json(user);
    } else {
      res.json({err: "Email or Password is incorrect"});
    }
  } catch (error) {
    res.status(400).send("Adding user failed.");
  }
};

exports.newOgpa = async (req, res) => {
  try {
    const user = await Ogpas.findOneAndUpdate({ email: req.body.email }, req.body).exec();
    if (user) {
      res.json(req.body);
    } else {
      const newUser = await new Ogpas(req.body).save();
      res.json(newUser);
    }
  } catch (error) {
    res.status(400).send("Adding user failed.");
  }
};

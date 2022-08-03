const Ogts = require("../models/ogt");

exports.getUser = async (req, res) => {
  const email = req.params.email;

  try {
    const user = await Ogts.findOne({ email });
    if (user) {
      res.json({ok: true});
    } else {
      res.json({ok: false});
    }
  } catch (error) {
    res.status(400).send("Fetching user failed.");
  }
};

exports.createOrUpdateUser = async (req, res) => {
  const email = req.body.email;

  try {
    const user = await Ogts.findOne({ email }).exec();
    if (user) {
      res.json(user);
    } else {
      const newUser = new Ogts(req.body).save();
      res.json(newUser);
    }
  } catch (error) {
    res.status(400).send("Create user failed.");
  }
};

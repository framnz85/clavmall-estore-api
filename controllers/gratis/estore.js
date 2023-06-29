const ObjectId = require("mongoose").Types.ObjectId;
const slugify = require("slugify");

const Estore = require("../../models/authority/estore");

exports.getEstore = async (req, res) => {
  try {
    const estore = await Estore.findOne({ slug: req.params.slug }).exec();
    res.json(estore);
  } catch (error) {
    res.json({ err: "Fetching store information fails. " + error.message });
  }
};

exports.updateEstore = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const estore = await Estore.findByIdAndUpdate(estoreid, req.body, {
      new: true,
    }).exec();
    if (!estore) {
      res.json({ err: "No eStore exist under ID: " + estoreid });
      return;
    }
    res.json(estore);
  } catch (error) {
    res.json({ err: "Fetching store information fails. " + error.message });
  }
};

exports.createEstore = async (req, res) => {
  try {
    const checkStoreExist = await Estore.findOne({
      slug: slugify(req.body.name.toString().toLowerCase()),
    });
    if (!checkStoreExist) {
      const checkEmailExist = await Estore.findOne({
        email: req.body.email,
      });
      if (!checkEmailExist) {
        const estore = new Estore({
          name: req.body.name,
          email: req.body.email,
          slug: slugify(req.body.name.toString().toLowerCase()),
          country: ObjectId(req.body.country),
        });
        await estore.save();
        res.json(estore);
      } else {
        res.json({
          err: `Store with an email ${req.body.email} is already existing. Please choose another Email Address.`,
        });
      }
    } else {
      res.json({
        err: `Store with a name ${req.body.name} is already existing. Please choose another Store Name.`,
      });
    }
  } catch (error) {
    res.json({ err: "Creating store fails. " + error.message });
  }
};

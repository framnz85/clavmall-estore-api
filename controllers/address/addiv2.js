const ObjectId = require("mongoose").Types.ObjectId;
const MyCountry = require("../../models/address/myCountry");
const { Addiv2 } = require("../../models/address/addiv2");
const { MyAddiv2 } = require("../../models/address/myAddiv2");

exports.listAddiv2 = async (req, res) => {
  const couid = new ObjectId(req.params.couid);
  const addiv1 = new ObjectId(req.params.addiv1);
  const coucode = req.query.coucode;
  const addiv2 = await Addiv2(coucode)
    .find({ couid, adDivId1: addiv1 })
    .sort({ name: 1 })
    .exec();
  res.json(addiv2);
};

exports.listMyAddiv2 = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const couid = new ObjectId(req.params.couid);
  const coucode = req.query.coucode;
  let addiv2 = [];

  if (req.params.addiv1 === "all") {
    addiv2 = await MyAddiv2(coucode, estoreid)
      .find({ couid })
      .sort({ name: 1 })
      .exec();
  } else {
    const addiv1 = new ObjectId(req.params.addiv1);
    addiv2 = await MyAddiv2(coucode, estoreid)
      .find({ couid, adDivId1: addiv1 })
      .sort({ name: 1 })
      .exec();
  }
  res.json(addiv2);
};

exports.estoreAddiv2s = async (req, res) => {
  const estoreid = req.params.estoreid;
  const couid = req.params.couid;
  try {
    const country = await MyCountry(estoreid).findOne({ _id: couid }).exec();
    const addiv2 = await MyAddiv2(country.countryCode, estoreid)
      .find({})
      .exec();
    res.json(addiv2);
  } catch (error) {
    res.json({ err: "Fetching location failed." });
  }
};

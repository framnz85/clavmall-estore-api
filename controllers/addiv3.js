const ObjectId = require("mongoose").Types.ObjectId;
const MyCountry = require("../models/address/myCountry");
const { Addiv3 } = require("../models/address/addiv3");
const { MyAddiv2 } = require("../models/address/myAddiv2");
const { MyAddiv3 } = require("../models/address/myAddiv3");

exports.read = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const coucode = req.query.coucode;
  try {
    const addiv3 = await MyAddiv3(coucode, estoreid)
      .findOne({
        _id: req.params.addiv3,
      })
      .exec();
    res.json(addiv3);
  } catch (error) {
    res.status(400).send("Location search failed.");
  }
};

exports.listNewAdded = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const coucode = req.query.coucode;
  const addiv2 = await MyAddiv2(coucode, estoreid)
    .find({})
    .limit(10)
    .exec();
  const addiv3 = await MyAddiv3(coucode, estoreid)
    .find({ adDivId2: { $in: addiv2.map((addiv => addiv._id)) } })
    .sort({ createAt: -1 })
    .exec();
  res.json(addiv3);
};

exports.listAddiv3 = async (req, res) => {
  const couid = new ObjectId(req.params.couid);
  const addiv1 = new ObjectId(req.params.addiv1);
  const addiv2 = new ObjectId(req.params.addiv2);
  const coucode = req.query.coucode;
  const addiv3 = await Addiv3(coucode)
    .find({ couid, adDivId1: addiv1, adDivId2: addiv2 })
    .sort({ name: 1 })
    .exec();
  res.json(addiv3);
};

exports.listMyAddiv3 = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const couid = new ObjectId(req.params.couid);
  const addiv1 = new ObjectId(req.params.addiv1);
  const coucode = req.query.coucode;
  let addiv3 = [];

  if (req.params.addiv2 === "all") {
    addiv3 = await MyAddiv3(coucode, estoreid)
      .find({ couid, adDivId1: addiv1 })
      .sort({ name: 1 })
      .exec();
  } else {
    const addiv2 = new ObjectId(req.params.addiv2);
    addiv3 = await MyAddiv3(coucode, estoreid)
      .find({ couid, adDivId1: addiv1, adDivId2: addiv2 })
      .sort({ name: 1 })
      .exec();
  }
  res.json(addiv3);
};

exports.updateMyAddiv3 = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const coucode = req.query.coucode;
  const couid = req.body.couid;
  try {
    const updated = await MyAddiv3(coucode, estoreid).findOneAndUpdate(
      { _id: req.params.addiv3 },
      { ...req.body, couid: ObjectId(couid) },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).send("Updating location failed.");
  }
};

exports.estoreAddiv3s = async (req, res) => {
  const estoreid = req.params.estoreid;
  const couid = req.params.couid;
  try {
    const country = await MyCountry(estoreid).findOne({_id: couid}).exec();
    const addiv3 = await MyAddiv3(country.countryCode, estoreid).find({}).exec();
    res.json(addiv3);
  } catch (error) {
    res.json({err: "Fetching location failed."});
  }
};

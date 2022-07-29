const ObjectId = require("mongoose").Types.ObjectId;
const { Addiv1 } = require("../models/address/addiv1");
const { MyAddiv1 } = require("../models/address/myAddiv1");

exports.listAddiv1 = async (req, res) => {
  const couid = new ObjectId(req.params.couid);
  const coucode = req.query.coucode;
  const addiv1 = await Addiv1(coucode).find({ couid }).sort({ name: 1 }).exec();
  res.json(addiv1);
};

exports.listMyAddiv1 = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const couid = req.params.couid;
  const coucode = req.query.coucode;
  const addiv1 = await MyAddiv1(coucode, estoreid)
    .find({ couid: new ObjectId(couid) })
    .sort({ name: 1 })
    .exec();
  res.json(addiv1);
};

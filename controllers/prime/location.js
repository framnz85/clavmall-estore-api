const Province = require("../../models/prime/province");
const Muncity = require("../../models/prime/muncity");

exports.getProvinces = async (req, res) => {
  try {
    const province = await Province.find({});
    res.json(province);
  } catch (error) {
    res.json({ err: "Getting provinces fails. " + error.message });
  }
};

exports.getMuncities = async (req, res) => {
  const prov = req.params.prov;
  try {
    const muncities = await Muncity.find({ province: prov });
    res.json(muncities);
  } catch (error) {
    res.json({ err: "Getting provinces fails. " + error.message });
  }
};

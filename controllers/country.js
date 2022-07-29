const Country = require("../models/address/country");
const MyCountry = require("../models/address/myCountry");

exports.listCountry = async (req, res) => {
  const countries = await Country.find({}).exec();
  res.json(countries);
};

exports.listMyCountry = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const countries = await MyCountry(estoreid).find({}).exec();
  res.json(countries);
};

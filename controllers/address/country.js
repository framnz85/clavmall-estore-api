const Country = require("../../models/address/country");
const MyCountry = require("../../models/address/myCountry");

exports.listCountry = async (req, res) => {
  const countries = await Country.find({}).exec();
  res.json(countries);
};

exports.listMyCountry = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const countries = await MyCountry(estoreid).find({}).exec();
  res.json(countries);
};

exports.estoreCountries = async (req, res) => {
  const estoreid = req.params.estoreid;
  try {
    const countries = await MyCountry(estoreid).find({}, "name").exec();
    res.json(countries);
  } catch (error) {
    res.json({ err: "Fetching location failed." });
  }
};

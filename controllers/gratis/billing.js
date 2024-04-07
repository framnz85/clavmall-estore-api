const ObjectId = require("mongoose").Types.ObjectId;
const slugify = require("slugify");

const Billing = require("../../models/gratis/billing");
const Estore = require("../../models/gratis/estore");

exports.createBilling = async (req, res) => {
  const resellid = req.headers.resellid;
  const estoreList = req.body.estoreList;
  let updateObj = {};

  try {
    const billing = new Billing({ ...req.body, resellid });
    await billing.save();

    for (i = 0; i < estoreList.length; i++) {
      if (estoreList[i].product === "Package A") {
        updateObj = { approval: "For Approval" };
      }
      if (estoreList[i].product === "Package B") {
        updateObj = { approval2: "For Approval" };
      }
      if (estoreList[i].product === "Package C") {
        updateObj = { approval3: "For Approval" };
      }

      await Estore.findByIdAndUpdate(estoreList[i].estoreid, updateObj, {
        new: true,
      }).exec();
    }

    res.json(billing);
  } catch (error) {
    res.json({ err: "Creating billing fails. " + error.message });
  }
};

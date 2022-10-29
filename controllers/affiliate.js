const ObjectId = require("mongoose").Types.ObjectId;
const Affiliate = require("../models/affiliate");
const Withdrawal = require("../models/withdrawal");

exports.list = async (req, res) => {
    const estoreid = req.headers.estoreid;
  
    try {
        const { sortkey, sort, currentPage, pageSize } = req.body;
        const curPage = currentPage || 1;

        const affiliates = await Affiliate(estoreid).find({})
            .skip((curPage - 1) * pageSize)
            .sort({ [sortkey]: sort })
            .limit(pageSize)
            .exec();

        const sumCommission = await Affiliate(estoreid).aggregate([
            { $match: { commission: { $gte: 0 }, status: "Approved" } },
            { $group: { _id : null, sum : { $sum: "$commission" } } }
        ]).exec();

        const sumWithdraw = await Affiliate(estoreid).aggregate([
            { $match: { commission: { $lte: 0 }, status: "Approved" } },
            { $group: { _id : null, sum : { $sum: "$commission" } } }
        ]).exec();

        const totalProducts = await Affiliate(estoreid).find({ commission: { $gte: 0 }, status: "Approved" }).exec();

        const countAffiliate = await Affiliate(estoreid).find({}).exec();
    
        res.json({affiliates, sumCommission, sumWithdraw, totalProducts: totalProducts.length, count: countAffiliate.length});
    } catch (error) {
        res.status(400).send("Listing product failed.");
    }
};

exports.create = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const { user, product, amount } = req.body;
    const newAffiliate = await Affiliate(estoreid).collection.insertOne({
      userid: ObjectId(user._id), name: user.name, product, amount, commission: -amount, status: "Pending", createdAt: new Date(), updatedAt: new Date(), __v: 0
    });
    const affid = newAffiliate.ops[0]._id;
    const adminWithdrawal = await new Withdrawal({estoreid, affid, userid: user._id, name: user.name, product, amount, commission: -amount, status: "Pending"}).save();
    await Affiliate(estoreid).findOneAndUpdate(
      { _id: affid },
      { withid: adminWithdrawal._id },
      { new: true }
    )
    res.json(newAffiliate);
  } catch (error) {
    res.status(400).send("Create affiliate failed.");
  }
};
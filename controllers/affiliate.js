const ObjectId = require("mongoose").Types.ObjectId;
const Affiliate = require("../models/affiliate");
const Withdrawal = require("../models/withdrawal");
const Ogts = require("../models/ogt");

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
            { $match: { commission: { $lte: 0 } } },
            { $group: { _id : null, sum : { $sum: "$commission" } } }
        ]).exec();

        const totalProducts = await Affiliate(estoreid).find({ commission: { $gte: 0 }, status: "Approved" }).exec();

        const countAffiliate = await Affiliate(estoreid).find({}).exec();
    
        res.json({affiliates, sumCommission, sumWithdraw, totalProducts: totalProducts.length, count: countAffiliate.length});
    } catch (error) {
        res.status(400).send("Listing affiliates failed.");
    }
};

exports.create = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const { user, product, values } = req.body;
    const newAffiliate = await Affiliate(estoreid).collection.insertOne({
      userid: ObjectId(user._id),
      name: user.name,
      product,
      amount: values.withdrawAmount,
      commission: -values.withdrawAmount,
      bank: values.bank,
      accountNumber: values.accountNumber,
      accountName: values.accountName,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    });
    const affid = newAffiliate.ops[0]._id;
    const adminWithdrawal = await new Withdrawal({
      estoreid,
      affid,
      userid: user._id,
      name: user.name,
      product,
      amount: values.withdrawAmount,
      commission: -values.withdrawAmount,
      bank: values.bank,
      accountNumber: values.accountNumber,
      accountName: values.accountName,
      status: "Pending"
    }).save();
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

exports.update = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const { values } = req.body;
    console.log(values)
    await Withdrawal.findOneAndUpdate(
      { _id: values.withid },
      { 
        amount: values.withdrawAmount,
        commission: -values.withdrawAmount,
        bank: values.bank,
        accountNumber: values.accountNumber,
        accountName: values.accountName,
      },
      { new: true }
    );
    await Affiliate(estoreid).findOneAndUpdate(
      { _id: values.affid },
      { 
        amount: values.withdrawAmount,
        commission: -values.withdrawAmount,
        bank: values.bank,
        accountNumber: values.accountNumber,
        accountName: values.accountName,
      },
      { new: true }
    );
    res.json({ok: true});
  } catch (error) {
    res.status(400).send("Delete category failed.");
  }
};

exports.prospectList = async (req, res) => {
    const estoreid = req.headers.estoreid;
  
    try {
        const { sortkey, sort, currentPage, pageSize } = req.body;
        const curPage = currentPage || 1;

        const prospects = await Ogts.find({refid: ObjectId(estoreid)})
            .skip((curPage - 1) * pageSize)
            .sort({ [sortkey]: sort })
            .limit(pageSize)
            .exec();

        const countProspects = await Affiliate(estoreid).find({}).exec();
    
        res.json({prospects, count: countProspects.length});
    } catch (error) {
        res.status(400).send("Listing prospects failed.");
    }
};

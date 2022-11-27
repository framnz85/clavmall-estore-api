const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../models/user");
const Order = require("../models/order");
const {
  orderProductUser,
  orderProductsProduct
} = require("./common");
const Referral = require("../models/referral");

exports.commissionlist = async (req, res) => {
    const estoreid = req.headers.estoreid;
    const email = req.user.email;
    const phone = req.user.phone;
    let user = {};

    if (email) {
        user = await User(estoreid).findOne({ email }).exec();
    } else if (phone) {
        user = await User(estoreid).findOne({ phone }).exec();
    }
  
    try {
        const { sortkey, sort, currentPage, pageSize } = req.body;
        const curPage = currentPage || 1;

        const commissions = await Referral(estoreid).find({ ownerid: ObjectId(user._id) })
            .skip((curPage - 1) * pageSize)
            .sort({ [sortkey]: sort })
            .limit(pageSize)
            .exec();
    
        res.json({commissions});
    } catch (error) {
        res.json({err: `Listing commissions failed. ${error.message}`});
    }
};

exports.referrallist = async (req, res) => {
    const estoreid = req.headers.estoreid;
    const email = req.user.email;
    const phone = req.user.phone;
    let user = {};

    if (email) {
        user = await User(estoreid).findOne({ email }).exec();
    } else if (phone) {
        user = await User(estoreid).findOne({ phone }).exec();
    }
  
    try {
        const { sortkey, sort, currentPage, pageSize } = req.body;
        const curPage = currentPage || 1;

        const referrals = await User(estoreid).find({ refid: ObjectId(user._id) })
            .skip((curPage - 1) * pageSize)
            .sort({ [sortkey]: sort })
            .limit(pageSize)
            .exec();
    
        res.json({referrals});
    } catch (error) {
        res.json({err: `Listing referrals failed. ${error.message}`});
    }
};

exports.referralorders = async (req, res) => {
    const estoreid = req.headers.estoreid;
    const email = req.user.email;
    const phone = req.user.phone;
    let user = {};

    if (email) {
        user = await User(estoreid).findOne({ email }).exec();
    } else if (phone) {
        user = await User(estoreid).findOne({ phone }).exec();
    }
  
    try {
        const { sortkey, sort, currentPage, pageSize } = req.body;
        const curPage = currentPage || 1;

        let referralIds = await User(estoreid).find({ refid: ObjectId(user._id) }, "_id").exec();
        referralIds = referralIds.map(ref => ref._id)

        let orders = await Order(estoreid).find({ orderedBy: { $in: referralIds } })
            .skip((curPage - 1) * pageSize)
            .sort({ [sortkey]: sort })
            .limit(pageSize)
            .exec();
        orders = await orderProductUser(orders, estoreid);
        orders = await orderProductsProduct(orders, estoreid);
    
        res.json({orders});
    } catch (error) {
        res.json({err: `Listing referral orders failed. ${error.message}`});
    }
};

exports.referralCreate = async (req, res) => {
    const estoreid = req.headers.estoreid;
  
    try {
        const { ownerid, orderid, orderCode, userid, username, amount, commission } = req.body;
        const referral = await User(estoreid).findOne({ _id: ObjectId(ownerid) }).exec();

        const checkCommission = await Referral(estoreid).findOne({orderid: ObjectId(orderid), orderCode}).exec();
        
        if (checkCommission) {
            res.json({err: `Referral commission already been given to ${referral.name}`});
        } else {
            await Referral(estoreid).collection.insertOne({
                ownerid: ObjectId(ownerid),
                ownername: referral.name,
                orderid: ObjectId(orderid),
                orderCode,
                userid: ObjectId(userid),
                username,
                amount,
                commission,
                status: "Approved",
                createdAt: new Date(),
                updatedAt: new Date(),
                __v: 0
            });
            res.json({refname: referral.name});
        }
    } catch (error) {
        res.json({err: `Creating referral commission failed. ${error.message}`});
    }
};

exports.allCommissionlist = async (req, res) => {
    const estoreid = req.headers.estoreid;
  
    try {
        const { sortkey, sort, currentPage, pageSize } = req.body;
        const curPage = currentPage || 1;

        const commissions = await Referral(estoreid).find({username: {$ne: "Withdraw"}})
            .skip((curPage - 1) * pageSize)
            .sort({ [sortkey]: sort })
            .limit(pageSize)
            .exec();
    
        res.json({commissions});
    } catch (error) {
        res.json({err: `Listing commissions failed. ${error.message}`});
    }
};

exports.editCommissionStatus = async (req, res) => {
    const estoreid = req.headers.estoreid;
    const {commid, status} = req.body
  
    try {
        const newCommission = await Referral(estoreid).findOneAndUpdate({ _id: ObjectId(commid) }, {status}, { new: true });
    
        res.json({newCommission});
    } catch (error) {
        res.json({err: `Updating commission status failed. ${error.message}`});
    }
};

exports.referralWithdraw = async (req, res) => {
    const estoreid = req.headers.estoreid;
    const email = req.user.email;
    const phone = req.user.phone;
    let user = {};

    if (email) {
        user = await User(estoreid).findOne({ email }).exec();
    } else if (phone) {
        user = await User(estoreid).findOne({ phone }).exec();
    }
        
    try {
        const { values } = req.body;
        const newAffiliate = await Referral(estoreid).collection.insertOne({
            ownerid: ObjectId(user._id),
            ownername: user.name,
            username: "Withdraw",
            orderCode: "Withdrawal",
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
        res.json(newAffiliate);
    } catch (error) {
        res.json({err: `Withdraw commission failed. ${error.message}`});
    }
};

exports.allWithdrawallist = async (req, res) => {
    const estoreid = req.headers.estoreid;
  
    try {
        const { sortkey, sort, currentPage, pageSize } = req.body;
        const curPage = currentPage || 1;

        const withdraws = await Referral(estoreid).find({username: "Withdraw"})
            .skip((curPage - 1) * pageSize)
            .sort({ [sortkey]: sort })
            .limit(pageSize)
            .exec();
    
        res.json({withdraws});
    } catch (error) {
        res.json({err: `Listing withdraws failed. ${error.message}`});
    }
};
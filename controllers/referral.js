const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../models/user");
const Order = require("../models/order");
const {
  orderProductUser,
  orderProductsProduct
} = require("./common");

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
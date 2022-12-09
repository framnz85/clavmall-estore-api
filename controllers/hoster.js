const ObjectId = require("mongoose").Types.ObjectId;
const Affiliate = require("../models/affiliate");
const Withdrawal = require("../models/withdrawal");
const Ogpa = require("../models/ogpa");
const md5 = require('md5');

exports.updateAffiliate = async (req, res) => {
    const estoreid = req.headers.estoreid;
    const affid = new ObjectId(req.params.affid);
  
    try {
        const affiliate = await Affiliate(estoreid).findByIdAndUpdate(affid, req.body, { new: true });
        
        if (!affiliate)
            return res.status(404).send(`No affiliate found on Affiliate ID: ${affid}`);

        res.send(affiliate);
    } catch (error) {
        res.status(400).send("Updating eStore failed.");
    }
};

exports.updateWithdrawal = async (req, res) => {
    const estoreid = req.body.estoreid;
    const withid = new ObjectId(req.params.withid);
    const status = req.body.status;
    let withdraw;
  
    try {
        if (status === "Approved") {
            withdraw = await Withdrawal.findByIdAndUpdate(withid, req.body, {new: true});
            await Affiliate(estoreid).findByIdAndUpdate(req.body.affid, {status: "Approved"}, {new: true});
        } else {
            withdraw = await Withdrawal.findByIdAndUpdate(withid, req.body, {new: true});
        }

        if (!withdraw)
        return res.status(404).send(`No user found on Withdrawal ID: ${withid}`);

        res.send(withdraw);
    } catch (error) {
        res.status(400).send("Updating withdrawal failed.");
    }
};

exports.updateOgpa = async (req, res) => {
    const ogpaid = new ObjectId(req.params.ogpaid);
    const { refid, affid, status, password } = req.body;
    const md5pass = md5(password);
    let ogpa;
  
    try {
        if (status === "active") {
            ogpa = await Ogpa.findByIdAndUpdate(ogpaid, { ...req.body, md5pass }, { new: true });
            if(refid) await Affiliate(refid).findByIdAndUpdate(affid, {status: "Approved"}, {new: true});
        } else {
            ogpa = await Ogpa.findByIdAndUpdate(ogpaid, { ...req.body, md5pass }, {new: true});
        }

        if (!ogpa)
            return res.status(404).send(`No user found on Ogpa ID: ${ogpaid}`);

        res.send(ogpa);
    } catch (error) {
        res.status(400).send("Updating Ogpa failed." + refid);
    }
};
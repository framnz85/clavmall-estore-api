const Ogpadet = require("../models/ogpadet");
const Ogpas = require("../models/ogpa");
const Product = require("../models/pmb");
const request = require('request');
const ObjectId = require("mongoose").Types.ObjectId;
const Affiliate = require("../models/affiliate");

exports.getOgpa = async (req, res) => {
  const ogpaId = "62e881f29d4bfbb9acd1d260";

  try {
    const ogpa = await Ogpadet.findOne({ _id: ogpaId });
    if (ogpa) {
      res.json(ogpa);
    } else {
      res.json({err: "No OGPA amount was fetch"});
    }
  } catch (error) {
    res.status(400).send("Fetching user failed.");
  }
};

exports.getOgpaEmail = async (req, res) => {
  try {
    const user = await Ogpas.findOne({
      email: req.params.email,
    }, "_id name email amount mobile payment").exec();
    if (user) {
      res.json(user);
    } else {
      res.json({err: "Email or Password is incorrect"});
    }
  } catch (error) {
    res.status(400).send("Adding user failed.");
  }
};

exports.existOgpa = async (req, res) => {
  try {
    const user = await Ogpas.findOne({
      email: req.params.email,
      md5pass: req.params.password,
    }, "_id name dateStart");
    if (user) {
      res.json(user);
    } else {
      res.json({err: "Email or Password is incorrect"});
    }
  } catch (error) {
    res.status(400).send("Adding user failed.");
  }
};

exports.newOgpa = async (req, res) => {
  try {
    const user = await Ogpas.findOneAndUpdate({ email: req.body.email }, req.body).exec();
    if (user) {
      res.json(req.body);
    } else {
      const { name, amount } = req.body;
      const newUser = await new Ogpas(req.body).save();
      const newAffiliate = await Affiliate(req.body.refid).collection.insertOne({
        name, product: "OGPA Program", amount, commission: 1000, status: "Pending", createdAt: new Date(), updatedAt: new Date(), __v: 0
      });
      const ogpaid = newUser._id;
      const affid = newAffiliate.ops[0]._id;
      await Ogpas.findOneAndUpdate(
        { _id: ogpaid },
        { affid },
        { new: true }
      )
      res.json(newUser);
    }
  } catch (error) {
    res.status(400).send("Adding user failed.");
  }
};

exports.manyChat = async (req, res) => {
  const mcid = req.params.mcid;
  const flowns = req.params.flowns;
  request(
    {
      url: 'https://api.manychat.com/fb/sending/sendFlow',
      method: 'POST',
      form: {
        "subscriber_id": mcid,
        "flow_ns": flowns
      },
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 843408572424096:ad8860bb8765434719648f616736d3af",
        "Accept": "application/json"
      },
    },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error' });
      }

      res.json(JSON.parse(body));
    }
  )
};

exports.manyChatPurchase = async (req, res) => {
  const mcid = req.params.mcid;
  const email = req.params.email;
  request(
    {
      url: 'https://api.manychat.com/fb/subscriber/setCustomField',
      method: 'POST',
      form: {
        "subscriber_id": mcid,
        "field_id": 130923,
        "field_value": email
      },
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 843408572424096:ad8860bb8765434719648f616736d3af",
        "Accept": "application/json"
      },
    },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error' });
      }

      res.json(JSON.parse(body));
    }
  )
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({}, "_id, title prices");
    if (products) {
      res.json(products);
    } else {
      res.json({err: "No products was fetch"});
    }
  } catch (error) {
    res.status(400).send("Fetching products failed.");
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.prodid }, "prices votes");
    if (product) {
      res.json(product);
    } else {
      res.json({err: "No product was fetch"});
    }
  } catch (error) {
    res.status(400).send("Fetching product failed.");
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate({ _id: ObjectId(req.params.prodid) }, req.body).exec();
    if (product) {
      res.json(product);
    } else {
      res.json({err: "No product was fetch"});
    }
  } catch (error) {
    res.status(400).send("Fetching product failed.");
  }
};

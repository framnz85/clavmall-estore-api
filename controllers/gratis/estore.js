const ObjectId = require("mongoose").Types.ObjectId;
const slugify = require("slugify");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const Estore = require("../../models/gratis/estore");
const User = require("../../models/gratis/user");

exports.getEstore = async (req, res) => {
  try {
    const estore = await Estore.findOne({ slug: req.params.slug })
      .populate("country")
      .exec();
    res.json(estore);
  } catch (error) {
    res.json({ err: "Fetching store information fails. " + error.message });
  }
};

exports.getEstoreCounters = async (req, res) => {
  try {
    const estore = await Estore.findOne({
      _id: ObjectId(req.params.estoreid),
    })
      .populate("country")
      .select("estoreChange productChange categoryChange paymentChange")
      .exec();
    res.json(estore);
  } catch (error) {
    res.json({ err: "Fetching store information fails. " + error.message });
  }
};

exports.updateEstore = async (req, res) => {
  const estoreid = req.headers.estoreid;
  let values = req.body;
  const name = req.body.name;

  if (name) {
    values = {
      ...values,
      slug: slugify(name.toString().toLowerCase()),
    };
  }

  try {
    const estore = await Estore.findByIdAndUpdate(estoreid, values, {
      new: true,
    })
      .populate("country")
      .exec();
    if (!estore) {
      res.json({ err: "No eStore exist under ID: " + estoreid });
      return;
    }
    res.json(estore);
  } catch (error) {
    res.json({ err: "Fetching store information fails. " + error.message });
  }
};

exports.createEstore = async (req, res) => {
  const refid = req.body.refid;
  try {
    const checkStoreExist = await Estore.findOne({
      slug: slugify(req.body.name.toString().toLowerCase()),
    });
    if (!checkStoreExist) {
      const checkEmailExist = await Estore.findOne({
        email: req.body.email,
      });
      if (!checkEmailExist) {
        const estore = new Estore({
          name: req.body.name,
          email: req.body.email,
          slug: slugify(req.body.name.toString().toLowerCase()),
          country: ObjectId(req.body.country),
        });
        await estore.save();

        if (refid) {
          const user = await User.findOne({
            _id: ObjectId(refid),
            role: "admin",
          }).exec();

          await Estore.findOneAndUpdate(
            { _id: user.estoreid },
            {
              $inc: {
                productLimit: 10,
                categoryLimit: 1,
                userLimit: 5,
                invites: 1,
              },
            }
          );
        }

        res.json(estore);
      } else {
        res.json({
          err: `Store with an email ${req.body.email} is already existing. Please choose another Email Address.`,
        });
      }
    } else {
      res.json({
        err: `Store with a name ${req.body.name} is already existing. Please choose another Store Name.`,
      });
    }
  } catch (error) {
    res.json({ err: "Creating store fails. " + error.message });
  }
};

exports.checkCosmic = async (req, res) => {
  const email = req.body.email;
  const slug = req.body.slug;

  try {
    const estore = await Estore.findOne({
      $or: [{ slug }, { email }],
      upStatus: "Pending",
    }).exec();
    if (estore) {
      const owner = await User.findOne({
        estoreid: estore._id,
        role: "admin",
      }).exec();
      res.json({ estore, owner });
    } else {
      res.json({ err: "No pending store exist with this parameters" });
    }
  } catch (error) {
    res.json({ err: "Fetching store information fails. " + error.message });
  }
};

exports.approveCosmic = async (req, res) => {
  try {
    const estore = await Estore.findByIdAndUpdate(req.body._id, req.body, {
      new: true,
    });
    if (estore) {
      const email = req.body.email;
      const name = req.body.name;
      const defaultClient = SibApiV3Sdk.ApiClient.instance;

      let apiKey = defaultClient.authentications["api-key"];
      apiKey.apiKey = process.env.BREVO_APIKEY;

      let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

      let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

      sendSmtpEmail = {
        to: [
          {
            email,
            name,
          },
        ],
        templateId: 208,
        headers: {
          "X-Mailin-custom":
            "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
        },
      };

      apiInstance.sendTransacEmail(sendSmtpEmail).then(
        function (data) {
          //
        },
        function (error) {
          res.json({ err: "Sending welcome email fails. " + error.message });
        }
      );

      res.json({ ok: true });
    } else {
      res.json({ err: "Updating was not successful" });
    }
  } catch (error) {
    res.json({ err: "Fetching store information fails. " + error.message });
  }
};

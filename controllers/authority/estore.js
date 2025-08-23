const ObjectId = require("mongoose").Types.ObjectId;
const Estore = require("../../models/authority/estore");
const { Addiv1 } = require("../../models/address/addiv1");
const { Addiv2 } = require("../../models/address/addiv2");
const { Addiv3 } = require("../../models/address/addiv3");
const MyCountry = require("../../models/address/myCountry");
const { MyAddiv1 } = require("../../models/address/myAddiv1");
const { MyAddiv2 } = require("../../models/address/myAddiv2");
const { MyAddiv3 } = require("../../models/address/myAddiv3");

exports.listCarousel = async (req, res) => {
  const estore = await Estore.find({ _id: req.params.estid })
    .populate("country")
    .exec();
  res.json(estore);
};

exports.listAll = async (req, res) => {
  const estore = await Estore.find({ _id: req.params.estid }).exec();
  res.json(estore);
};

exports.listChanges = async (req, res) => {
  const estore = await Estore.find({ _id: req.params.estid })
    .select(
      "categoryChange parentChange subcatChange productChange estoreChange recurringCycle planType endDate status"
    )
    .exec();
  if (
    estore[0].recurringCycle &&
    estore[0].recurringCycle === "One" &&
    (!estore[0].endDate ||
      new Date(estore[0].endDate).getTime() < new Date().getTime())
  ) {
    estore[0] = { ...estore[0]._doc, status: "stop" };
    await Estore.findOneAndUpdate(
      { _id: req.params.estid },
      { status: "stop" },
      { new: true }
    );
  }
  res.json(estore);
};

exports.update = async (req, res) => {
  try {
    const { carouselImages } = req.body;
    const updated = await Estore.findOneAndUpdate(
      { _id: req.params.estid },
      { carouselImages },
      { new: true }
    );
    if (!updated) {
      res.status(404).send("No eStore exist under ID: " + req.params.estid);
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(400).send("Updating eStore failed.");
  }
};

exports.estoreupdate = async (req, res) => {
  try {
    const updated = await Estore.findOneAndUpdate(
      { _id: req.params.estid },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).send("Updating eStore failed.");
  }
};

exports.updatechanges = async (req, res) => {
  try {
    const updated = await Estore.findOneAndUpdate(
      { _id: req.params.estid },
      { $inc: { [req.body.property]: 1 } },
      { new: true }
    ).populate("country");
    res.json(updated);
  } catch (error) {
    res.status(400).send("Updating eStore failed.");
  }
};

exports.copyAllAddiv1 = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { country, details } = req.body;

  try {
    await MyCountry(estoreid).collection.insertOne({
      ...country,
      _id: new ObjectId(country._id),
    });
  } catch (error) {}

  const addiv1 = await Addiv1(country.countryCode).find({}).exec();
  addiv1
    .map((data) => ({
      ...data._doc,
    }))
    .forEach(async (data) => {
      try {
        await MyAddiv1(country.countryCode, estoreid).collection.insertOne({
          ...data,
          couid: new ObjectId(data.couid),
        });
      } catch (error) {}
    });

  const addiv2 = await Addiv2(country.countryCode).find({}).exec();
  addiv2
    .map((data) => ({
      ...data._doc,
    }))
    .forEach(async (data) => {
      try {
        await MyAddiv2(country.countryCode, estoreid).collection.insertOne({
          ...data,
          couid: new ObjectId(data.couid),
          adDivId1: new ObjectId(data.adDivId1),
        });
      } catch (error) {}
    });

  const addiv3 = await Addiv3(country.countryCode).find({}).exec();
  addiv3
    .map((data) => ({
      ...data._doc,
      ...details,
    }))
    .forEach(async (data) => {
      try {
        await MyAddiv3(country.countryCode, estoreid).collection.insertOne({
          ...data,
          couid: new ObjectId(data.couid),
          adDivId1: new ObjectId(data.adDivId1),
          adDivId2: new ObjectId(data.adDivId2),
        });
      } catch (error) {}
    });

  res.json({ ok: true });
};

exports.saveCreatedLocation1 = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { values, details } = req.body;
  const { country, addiv1, addiv2, addiv3 } = values;

  try {
    await MyCountry(estoreid).collection.insertOne({
      ...country,
      _id: new ObjectId(country._id),
    });
  } catch (error) {}

  MyAddiv1(country.countryCode, estoreid)
    .collection.insertOne({
      name: addiv1.name,
      couid: new ObjectId(country._id),
    })
    .then((result1) => {
      MyAddiv2(country.countryCode, estoreid)
        .collection.insertOne({
          name: addiv2.name,
          couid: new ObjectId(country._id),
          adDivId1: new ObjectId(result1.ops[0]._id),
        })
        .then((result2) => {
          MyAddiv3(country.countryCode, estoreid).collection.insertOne({
            name: addiv3.name,
            couid: new ObjectId(country._id),
            adDivId1: new ObjectId(result1.ops[0]._id),
            adDivId2: new ObjectId(result2.ops[0]._id),
            ...details,
          });
        });
    });

  res.json({ ok: true });
};

exports.copyAllAddiv2 = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { country, addiv1, details } = req.body;

  try {
    await MyCountry(estoreid).collection.insertOne({
      ...country,
      _id: new ObjectId(country._id),
    });
  } catch (error) {}

  try {
    await MyAddiv1(country.countryCode, estoreid).collection.insertOne({
      ...addiv1,
      _id: new ObjectId(addiv1._id),
      couid: new ObjectId(country._id),
    });
  } catch (error) {}

  const addiv2 = await Addiv2(country.countryCode)
    .find({
      couid: new ObjectId(country._id),
      adDivId1: new ObjectId(addiv1._id),
    })
    .exec();
  addiv2
    .map((data) => ({
      ...data._doc,
    }))
    .forEach(async (data) => {
      try {
        await MyAddiv2(country.countryCode, estoreid).collection.insertOne({
          ...data,
          couid: new ObjectId(data.couid),
          adDivId1: new ObjectId(data.adDivId1),
        });
      } catch (error) {}
    });

  const addiv3 = await Addiv3(country.countryCode)
    .find({
      couid: new ObjectId(country._id),
      adDivId1: new ObjectId(addiv1._id),
    })
    .exec();
  addiv3
    .map((data) => ({
      ...data._doc,
      ...details,
    }))
    .forEach(async (data) => {
      try {
        await MyAddiv3(country.countryCode, estoreid).collection.insertOne({
          ...data,
          couid: new ObjectId(data.couid),
          adDivId1: new ObjectId(data.adDivId1),
          adDivId2: new ObjectId(data.adDivId2),
        });
      } catch (error) {}
    });

  res.json({ ok: true });
};

exports.saveCreatedLocation2 = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { values, details } = req.body;
  const { country, addiv1, addiv2, addiv3 } = values;

  try {
    await MyCountry(estoreid).collection.insertOne({
      ...country,
      _id: new ObjectId(country._id),
    });
  } catch (error) {}

  try {
    await MyAddiv1(country.countryCode, estoreid).collection.insertOne({
      ...addiv1,
      _id: new ObjectId(addiv1._id),
      couid: new ObjectId(country._id),
    });
  } catch (error) {}

  MyAddiv2(country.countryCode, estoreid)
    .collection.insertOne({
      name: addiv2.name,
      couid: new ObjectId(country._id),
      adDivId1: new ObjectId(addiv1._id),
    })
    .then((result2) => {
      MyAddiv3(country.countryCode, estoreid).collection.insertOne({
        name: addiv3.name,
        couid: new ObjectId(country._id),
        adDivId1: new ObjectId(addiv1._id),
        adDivId2: new ObjectId(result2.ops[0]._id),
        ...details,
      });
    });

  res.json({ ok: true });
};

exports.copyAllAddiv3 = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { country, addiv1, addiv2, details } = req.body;

  try {
    await MyCountry(estoreid).collection.insertOne({
      ...country,
      _id: new ObjectId(country._id),
    });
  } catch (error) {}

  try {
    await MyAddiv1(country.countryCode, estoreid).collection.insertOne({
      ...addiv1,
      _id: new ObjectId(addiv1._id),
      couid: new ObjectId(country._id),
    });
  } catch (error) {}

  try {
    await MyAddiv2(country.countryCode, estoreid).collection.insertOne({
      ...addiv2,
      _id: new ObjectId(addiv2._id),
      couid: new ObjectId(country._id),
      adDivId1: new ObjectId(addiv1._id),
    });
  } catch (error) {}

  const addiv3 = await Addiv3(country.countryCode)
    .find({
      couid: new ObjectId(country._id),
      adDivId1: new ObjectId(addiv1._id),
      adDivId2: new ObjectId(addiv2._id),
    })
    .exec();
  addiv3
    .map((data) => ({
      ...data._doc,
      ...details,
    }))
    .forEach(async (data) => {
      try {
        await MyAddiv3(country.countryCode, estoreid).collection.insertOne({
          ...data,
          couid: new ObjectId(data.couid),
          adDivId1: new ObjectId(data.adDivId1),
          adDivId2: new ObjectId(data.adDivId2),
        });
      } catch (error) {}
    });

  res.json({ ok: true });
};

exports.saveCreatedLocation3 = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { values, details } = req.body;
  const { country, addiv1, addiv2, addiv3 } = values;

  try {
    await MyCountry(estoreid).collection.insertOne({
      ...country,
      _id: new ObjectId(country._id),
    });
  } catch (error) {}

  try {
    await MyAddiv1(country.countryCode, estoreid).collection.insertOne({
      ...addiv1,
      _id: new ObjectId(addiv1._id),
      couid: new ObjectId(country._id),
    });
  } catch (error) {}

  try {
    await MyAddiv2(country.countryCode, estoreid).collection.insertOne({
      ...addiv2,
      _id: new ObjectId(addiv2._id),
      couid: new ObjectId(country._id),
      adDivId1: new ObjectId(addiv1._id),
    });
  } catch (error) {}

  MyAddiv3(country.countryCode, estoreid).collection.insertOne({
    name: addiv3.name,
    couid: new ObjectId(country._id),
    adDivId1: new ObjectId(addiv1._id),
    adDivId2: new ObjectId(addiv2._id),
    ...details,
  });

  res.json({ ok: true });
};

exports.saveLocation3 = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { country, addiv1, addiv2, addiv3, details } = req.body;

  try {
    await MyCountry(estoreid).collection.insertOne({
      ...country,
      _id: new ObjectId(country._id),
    });
  } catch (error) {}

  try {
    await MyAddiv1(country.countryCode, estoreid).collection.insertOne({
      ...addiv1,
      _id: new ObjectId(addiv1._id),
      couid: new ObjectId(country._id),
    });
  } catch (error) {}

  try {
    await MyAddiv2(country.countryCode, estoreid).collection.insertOne({
      ...addiv2,
      _id: new ObjectId(addiv2._id),
      couid: new ObjectId(country._id),
      adDivId1: new ObjectId(addiv1._id),
    });
  } catch (error) {}

  try {
    await MyAddiv3(country.countryCode, estoreid).collection.insertOne({
      ...addiv3,
      _id: new ObjectId(addiv3._id),
      couid: new ObjectId(country._id),
      adDivId1: new ObjectId(addiv1._id),
      adDivId2: new ObjectId(addiv2._id),
      ...details,
    });
  } catch (error) {}

  res.json({ ok: true });
};

exports.deleteAddiv3 = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const coucode = req.query.coucode;
    const addiv3 = req.query.addiv3;

    await MyAddiv3(coucode, estoreid)
      .findOneAndRemove({
        _id: addiv3,
      })
      .exec();

    res.json({ ok: true });
  } catch (error) {
    res.status(400).send("Location delete failed.");
  }
};

exports.deleteAddiv2 = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const coucode = req.query.coucode;
    const addiv2 = req.query.addiv2;

    await MyAddiv2(coucode, estoreid)
      .findOneAndRemove({
        _id: addiv2,
      })
      .exec();

    await MyAddiv3(coucode, estoreid)
      .deleteMany({
        adDivId2: new ObjectId(addiv2),
      })
      .exec();

    res.json({ ok: true });
  } catch (error) {
    res.status(400).send("Location delete failed.");
  }
};

exports.deleteAddiv1 = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const coucode = req.query.coucode;
    const addiv1 = req.query.addiv1;

    await MyAddiv1(coucode, estoreid)
      .findOneAndRemove({
        _id: addiv1,
      })
      .exec();

    await MyAddiv2(coucode, estoreid)
      .deleteMany({
        adDivId1: new ObjectId(addiv1),
      })
      .exec();

    await MyAddiv3(coucode, estoreid)
      .deleteMany({
        adDivId1: new ObjectId(addiv1),
      })
      .exec();

    res.json({ ok: true });
  } catch (error) {
    res.status(400).send("Location delete failed.");
  }
};

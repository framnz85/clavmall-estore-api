const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const User = require("../../models/university/user");
const Program = require("../../models/university/program");
const ProgramSale = require("../../models/university/programSale");

exports.getProgram = async (req, res) => {
  const { slug } = req.params;
  try {
    const program = await Program.findOne({
      $or: [{ slug }, { saleSlug: slug }],
    }).select("-salesPage");
    res.json(program);
  } catch (error) {
    res.json({ err: "Fetching programs failed." });
  }
};

exports.getPrograms = async (req, res) => {
  try {
    const program = await Program.find().select("-salesPage");
    res.json(program);
  } catch (error) {
    res.json({ err: "Fetching programs failed." });
  }
};

exports.getMyPrograms = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  try {
    const result = await User.findOne({ email, password });
    if (result) {
      const myPrograms = await Program.find({
        owner: ObjectId(result._id),
      }).select("-salesPage");
      res.json(myPrograms);
    } else {
      res.json({ err: "Error fetching user details." });
    }
  } catch (error) {
    res.json({ err: "Fetching programs failed." });
  }
};

exports.createProgram = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  try {
    const result = await User.findOne({ email, password });
    if (result) {
      const program = new Program({ ...req.body, owner: ObjectId(result._id) });
      program.save();

      res.json(program);
    } else {
      res.json({ err: "Error fetching user details." });
    }
  } catch (error) {
    res.json({ err: "Creating program failed." });
  }
};

exports.updateProgram = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  const progid = req.params.progid;
  const { saleid, salesPage, index } = req.body;
  try {
    const result = await User.findOne({ email, password });
    if (result) {
      if (index === 1) {
        const existSale = saleid
          ? await ProgramSale.findOne({
              _id: ObjectId(saleid),
              progid: ObjectId(progid),
              owner: result._id,
            })
          : await ProgramSale.findOne({
              progid: ObjectId(progid),
              owner: result._id,
            });
        if (existSale) {
          const updateSale = await ProgramSale.findOneAndUpdate(
            {
              _id: existSale._id,
              progid: ObjectId(progid),
              owner: result._id,
            },
            { salesPageTemp: salesPage }
          );
          if (updateSale) {
            res.json({ ok: true });
          } else {
            res.json({ err: "Error updating first program sales page." });
          }
        } else {
          new ProgramSale({
            progid: ObjectId(progid),
            owner: result._id,
            salesPageTemp: salesPage,
          }).save((error, result) => {
            if (error) {
              res.json({ err: "Error saving program sales page." });
            } else {
              res.json({ saleid: result._id });
            }
          });
        }
      } else {
        const updateSale = await ProgramSale.findOneAndUpdate(
          {
            _id: ObjectId(saleid),
            progid: ObjectId(progid),
            owner: result._id,
          },
          { $push: { salesPageTemp: salesPage } }
        );
        if (updateSale) {
          res.json({ ok: true });
        } else {
          res.json({ err: "Error updating program sales page." });
        }
      }
    } else {
      res.json({ err: "Error fetching user details." });
    }
  } catch (error) {
    res.json({ err: "Updating program failed." });
  }
};

exports.getProgramSales = async (req, res) => {
  const { progid } = req.params;
  try {
    const salesPage = await ProgramSale.findOne({
      progid: ObjectId(progid),
    }).select("-salesPageTemp");
    res.json(salesPage);
  } catch (error) {
    res.json({ err: "Fetching program sales page failed." });
  }
};

exports.copySalesTemp = async (req, res) => {
  const { saleid, progid } = req.params;
  try {
    const existSale = await ProgramSale.findOne({
      _id: ObjectId(saleid),
      progid: ObjectId(progid),
    });
    if (existSale) {
      const salesPageTemp = existSale.salesPageTemp;
      const salesPage = await ProgramSale.findOneAndUpdate(
        {
          _id: ObjectId(saleid),
          progid: ObjectId(progid),
        },
        { $set: { salesPage: salesPageTemp } }
      );
      if (salesPage) res.json({ ok: true });
    } else {
      res.json({ err: "Program sales page doesn't exist." });
    }
  } catch (error) {
    console.log(error);
    res.json({ err: "Fetching program sales page failed." });
  }
};

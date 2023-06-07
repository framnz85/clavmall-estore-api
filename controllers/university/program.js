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
  const { salesPage, index } = req.body;
  try {
    const result = await User.findOne({ email, password });
    if (result) {
      if (index === 1) {
        const existSale = await ProgramSale.findOne({
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
            { salesPage }
          );
          if (updateSale) {
            res.json(updateSale);
          } else {
            res.json({ err: "Error saving program sales page." });
          }
        } else {
          const newSale = new ProgramSale({
            progid: ObjectId(progid),
            owner: result._id,
            salesPage,
          }).save();
          if (newSale) {
            res.json(newSale);
          } else {
            res.json({ err: "Error saving program sales page." });
          }
        }
      } else {
        const updateSale = await ProgramSale.findOneAndUpdate(
          { progid: ObjectId(progid), owner: result._id },
          { $push: { salesPage } }
        );
        if (updateSale) {
          res.json(updateSale);
        } else {
          res.json({ err: "Error saving program sales page." });
        }
      }
    } else {
      res.json({ err: "Error fetching user details." });
    }
  } catch (error) {
    if (error.code === 11000) {
      res.json({ err: "Program Slug or Sales Slug is already existing" });
    } else {
      res.json({ err: "Updating program failed." });
    }
  }
};

exports.getProgramSales = async (req, res) => {
  const { progid } = req.params;
  try {
    const salesPage = await ProgramSale.findOne({
      progid: ObjectId(progid),
    });
    res.json(salesPage);
  } catch (error) {
    res.json({ err: "Fetching program sales page failed." });
  }
};

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const User = require("../../models/university/user");
const Program = require("../../models/university/program");

exports.getProgram = async (req, res) => {
  const { slug } = req.params
  try {
    const program = await Program.findOne({$or: [{slug}, {saleSlug: slug}]});
    res.json(program);
  } catch (error) {
    res.json({err: "Fetching programs failed."});
  }
};

exports.getPrograms = async (req, res) => {
  try {
    const program = await Program.find();
    res.json(program);
  } catch (error) {
    res.json({err: "Fetching programs failed."});
  }
};

exports.getMyPrograms = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  try {
    const result = await User.findOne({ email, password });
    if (result) {
      const myPrograms = await Program.find({owner: ObjectId(result._id)});
      res.json(myPrograms);
    } else {
      res.json({err: "Error fetching user details."});
    }
  } catch (error) {
    res.json({err: "Fetching programs failed."});
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
      res.json({err: "Error fetching user details."});
    }
  } catch (error) {
    res.json({err: "Creating program failed."});
  }
};

exports.updateProgram = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  const progid = req.params.progid;
  try {
    const result = await User.findOne({ email, password });
    if (result) {
      const updated = await Program.findOneAndUpdate(
        { _id: ObjectId(progid), owner: result._id },
        req.body,
        { new: true }
      );
      if (updated) {
        res.json(updated);
      } else {
        res.json({err: "No program exist under Program ID: " + progid + " or you are not the owner of the program"});
      }
    } else {
      res.json({err: "Error fetching user details."});
    }
  } catch (error) {
    if (error.code === 11000) {
      res.json({err: "Program Slug or Sales Slug is already existing"});
    } else {
      res.json({err: "Updating program failed."});
    }
  }
};
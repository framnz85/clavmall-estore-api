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
      const program = new Program({
        ...req.body,
        owner: ObjectId(result._id),
      });
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
  try {
    const result = await User.findOne({ email, password });
    if (result) {
      delete req.body.productChange;
      const update = await Program.findOneAndUpdate(
        {
          _id: ObjectId(progid),
          owner: result._id,
        },
        { ...req.body, $inc: { productChange: 1 } }
      );
      if (update) {
        res.json({ ok: true });
      } else {
        res.json({ err: "Error updating program details." });
      }
    } else {
      res.json({ err: "Error fetching user details." });
    }
  } catch (error) {
    res.json({ err: "Updating program failed." });
  }
};

exports.updateSalesPage = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  const progid = req.params.progid;
  const { saleid, title, salesPagesCount } = req.body;
  try {
    const result = await User.findOne({ email, password });
    if (result) {
      if (saleid) {
        const updateSale = await ProgramSale.findOneAndUpdate(
          {
            _id: ObjectId(saleid),
            progid: ObjectId(progid),
            owner: result._id,
          },
          { title, salesPagesCount },
          { new: true }
        );
        if (updateSale) {
          res.json(updateSale);
        } else {
          res.json({ err: "Error updating first program sales page." });
        }
      } else {
        const newProgSale = new ProgramSale({
          progid: ObjectId(progid),
          owner: result._id,
          title,
          salesPagesCount,
        });

        await newProgSale.save();

        if (newProgSale) {
          res.json(newProgSale);
        } else {
          res.json({ err: "Error saving program sales page." });
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
    const salesPage = await ProgramSale.find({
      progid: ObjectId(progid),
    }).sort("createdAt");
    res.json(salesPage);
  } catch (error) {
    res.json({ err: "Fetching program sales page failed." });
  }
};

exports.deleteProgramSales = async (req, res) => {
  const email = req.user.email;
  const password = req.user.password;
  const { progid, saleid } = req.params;

  try {
    const result = await User.findOne({ email, password });
    if (result) {
      const salesPage = await ProgramSale.findOneAndDelete({
        _id: ObjectId(saleid),
        progid: ObjectId(progid),
        owner: result._id,
      });
      res.json(salesPage);
    } else {
      res.json({ err: "Error fetching user details." });
    }
  } catch (error) {
    res.json({ err: "Deleting program sales page failed." });
  }
};

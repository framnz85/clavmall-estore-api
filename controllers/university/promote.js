const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const Promote = require("../../models/university/promote");

exports.getPromote = async (req, res) => {
  const progid = req.body.progid;
  const pageSize = req.body.pageSize;
  const current = req.body.current;
  const sortkey = req.body.sortkey;
  const sort = req.body.sort;
  const type = req.body.type;

  try {
    if (type === "all") {
      const promote = await Promote.find({ program: ObjectId(progid) })
        .skip((current - 1) * pageSize)
        .sort({ [sortkey]: sort })
        .limit(pageSize);
      const totalPromote = await Promote.find({
        program: ObjectId(progid),
      }).exec();

      res.json({ promote, total: totalPromote.length });
    } else {
      const promote = await Promote.find({
        program: ObjectId(progid),
        type,
      })
        .skip((current - 1) * pageSize)
        .sort({ [sortkey]: sort })
        .limit(pageSize);
      const totalPromote = await Promote.find({
        program: ObjectId(progid),
        type,
      }).exec();

      res.json({ promote, total: totalPromote.length });
    }
  } catch (error) {
    res.json({ err: "Fetching faculty promotion failed." });
  }
};

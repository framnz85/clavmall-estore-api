const Schedule = require("../../models/prime/schedule");

exports.getSchedule = async (req, res) => {
  const month = req.params.month;
  try {
    const schedule = await Schedule.findOne({ month });
    res.json(schedule);
  } catch (error) {
    res.json({ err: "Getting schedule fails. " + error.message });
  }
};

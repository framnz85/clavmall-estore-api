const Schedule = require("../../models/prime/schedule");

exports.getSchedule = async (req, res) => {
  const schedType = req.params.schedType;
  try {
    const schedule = await Schedule.findOne({ schedType });
    res.json(schedule);
  } catch (error) {
    res.json({ err: "Getting schedule fails. " + error.message });
  }
};

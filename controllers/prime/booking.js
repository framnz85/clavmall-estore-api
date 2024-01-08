const Booking = require("../../models/prime/booking");

exports.addBooking = async (req, res) => {
  const { name, email, phone, ques1, ques4, ques5, month } = req.body;

  try {
    const result = await Booking.findOne({ email });
    if (result) {
      if (result.month < month) {
        await Booking.findOneAndUpdate(
          { email },
          { phone, muncity: ques1, incomeGoal: ques4, investment: ques5, month }
        );
        res.json({ ...result._doc, month });
      } else {
        await Booking.findOneAndUpdate(
          { email },
          { phone, muncity: ques1, incomeGoal: ques4, investment: ques5 }
        );
        res.json({ ...result._doc, month: result.month + 1 });
      }
    } else {
      const booking = new Booking({
        name,
        email,
        phone,
        muncity: ques1,
        incomeGoal: ques4,
        investment: ques5,
        month,
      });
      booking.save();
      res.json(booking);
    }
  } catch (error) {
    res.json({ err: "Adding booking fails. " + error.message });
  }
};

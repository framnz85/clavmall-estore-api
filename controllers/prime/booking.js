const Booking = require("../../models/prime/booking");

exports.addBooking = async (req, res) => {
  const { name, email, phone, prov, ques1, ques4, ques5, ques7, ques8 } =
    req.body;

  try {
    const result = await Booking.findOne({ email });
    if (result) {
      await Booking.findOneAndUpdate(
        { email },
        {
          phone,
          province: prov,
          muncity: ques1,
          incomeGoal: ques4,
          investment: ques5,
          hasStore: ques7 === "yes",
          isSupermarket: ques8 === "yes",
        }
      );
      res.json({ ...result._doc, schedType: 2 });
    } else {
      const booking = new Booking({
        name,
        email,
        phone,
        province: prov,
        muncity: ques1,
        incomeGoal: ques4,
        investment: ques5,
        hasStore: ques7 === "yes",
        isSupermarket: ques8 === "yes",
        schedType: 1,
      });
      booking.save();
      res.json(booking);
    }
  } catch (error) {
    res.json({ err: "Adding booking fails. " + error.message });
  }
};

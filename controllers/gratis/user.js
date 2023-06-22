const ObjectId = require("mongoose").Types.ObjectId;

const User = require("../../models/gratis/user");

exports.getUserDetails = async (req, res) => {
  const email = req.user.email;

  try {
    const user = await User.findOne({ email }).populate("estoreid").exec();
    if (user) {
      res.json(user);
    } else {
      res.json({ err: "Cannot fetch the user details." });
    }
  } catch (error) {
    console.log(error);
    res.json({ err: "Fetching user information fails. " + error.message });
  }
};

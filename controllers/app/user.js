const ObjectId = require("mongoose").Types.ObjectId;

const User = require("../../models/gratis/user");

exports.getUsers = async (req, res) => {
  const estoreid = req.headers.estoreid;

  try {
    const users = await User.find({
      estoreid: ObjectId(estoreid),
    }).exec();

    res.json(users);
  } catch (error) {
    res.json({ err: "Getting all users failed." + error.message });
  }
};

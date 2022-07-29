const User = require("../models/user");
const { populateWishlist, populateProduct } = require("./common");

exports.createOrUpdateUser = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { name, picture, email } = req.user;
  const newAddress = req.body.address;

  try {
    const user = await User(estoreid).findOneAndUpdate(
      { email },
      newAddress ? { name, picture, address: newAddress } : { name, picture },
      { new: true }
    );

    if (user) {
      res.json(user);
    } else {
      const newUser = await User(estoreid).collection.insertOne({
        email,
        name,
        picture,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      });
      res.json(newUser);
    }
  } catch (error) {
    res.status(400).send("Create user failed.");
  }
};

exports.currentUser = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    User(estoreid).findOne({ email: req.user.email })
      .exec(async (err, user) => {
        if (err) throw new Error(err);
        let wishlist = await populateWishlist(user.wishlist, estoreid);
        wishlist = await populateProduct(wishlist, estoreid);
        user = { ...(user._doc ? user._doc : user) , wishlist }
        res.json(user);
      });
  } catch (error) {
    res.status(400).send("Fetching user failed.");
  }
};

exports.updateEmailAddress = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const { oldEmail } = req.body;
  try {
    const user = await User(estoreid).findOneAndUpdate({
      email: oldEmail
    }, {
      email: req.user.email
    }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(400).send("Fetching user failed.");
  }
};

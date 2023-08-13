const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../../models/gratis/user");
const Estore = require("../../models/gratis/estore");
const Notification = require("../../models/authority/notification");

const { sendPushNotification } = require("../../notification/webpush");

exports.biDailyCheck = () => {
  let cycleNotify = true;
  setInterval(async () => {
    const users = await User.find(
      {
        $nor: [{ endPoint: { $exists: false } }, { endPoint: { $size: 0 } }],
        role: "admin",
      },
      { endPoint: 1, estoreid: 1, emailConfirm: 1, dayNotify: 1 }
    );

    const dataText = await Notification.findOne({ type: "cycle" }).exec();

    users.forEach(async (user) => {
      user.endPoint.forEach(async (endP) => {
        if (cycleNotify) {
          sendPushNotification(JSON.parse(endP), dataText);
        } else {
          const day = user.dayNotify
            ? user.dayNotify === 0
              ? 1
              : user.dayNotify
            : 1;
          const dailyText = await Notification.findOne({
            type: "daily",
            day,
          }).exec();
          if (dailyText) {
            sendPushNotification(JSON.parse(endP), dailyText);
            await User.findOneAndUpdate(
              { _id: user._id },
              { dayNotify: day + 1 },
              {
                new: true,
              }
            );
          }
        }
        if (!user.emailConfirm) {
          const estore = await Estore.findOne({
            _id: ObjectId(user.estoreid),
          }).exec();
          if (estore) {
            const confirmText = {
              title: "Needs To Verify Your Account",
              body: "Please be reminded in order to fully use Gratis Clavstore, you need to verify your email address first",
              icon: "https://clavstoreimages.etnants.com/estore_images/gratis.png",
              tag: "verify-email",
              actions: [{ action: "access", title: "Verify Email" }],
              data: {
                url: "/" + estore.slug + "/user/account",
              },
            };
            sendPushNotification(JSON.parse(endP), confirmText);
          }
        }
      });
      cycleNotify = !cycleNotify;
    });
  }, 172800000);
};

// 172800000

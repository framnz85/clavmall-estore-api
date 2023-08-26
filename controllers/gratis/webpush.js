const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../../models/gratis/user");
const Estore = require("../../models/gratis/estore");
const Notification = require("../../models/authority/notification");

const { sendPushNotification } = require("../../notification/webpush");

const sendDailyNotif = async (endP, user) => {
  const day = user.dayNotify ? (user.dayNotify === 0 ? 1 : user.dayNotify) : 1;
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
};

const sendSalesNotif = async (endP, user) => {
  const day = user.daySales ? (user.daySales === 0 ? 1 : user.daySales) : 1;
  const dailyText = await Notification.findOne({
    type: "sales",
    day,
  }).exec();
  if (dailyText) {
    sendPushNotification(JSON.parse(endP), dailyText);
    await User.findOneAndUpdate(
      { _id: user._id },
      { daySales: day + 1 },
      {
        new: true,
      }
    );
  }
};

exports.gratisWebPush = () => {
  let cycleNotify = 1;
  setInterval(async () => {
    const users = await User.find(
      {
        $nor: [{ endPoint: { $exists: false } }, { endPoint: { $size: 0 } }],
        role: "admin",
      },
      { endPoint: 1, estoreid: 1, emailConfirm: 1, dayNotify: 1, daySales: 1 }
    );

    users.forEach(async (user) => {
      user.endPoint.forEach(async (endP) => {
        if (cycleNotify === 1) {
          const dataText = await Notification.findOne({ type: "cycle" }).exec();
          const randomNum = Math.floor(Math.random() * 100);
          dataText.tag = dataText.tag + randomNum;
          sendPushNotification(JSON.parse(endP), dataText);
        } else if (cycleNotify === 2) {
          sendDailyNotif(endP, user);
        } else {
          if (user.dayNotify < 5) {
            sendDailyNotif(endP, user);
          } else {
            sendSalesNotif(endP, user);
          }
        }
        if (!user.emailConfirm) {
          const estore = await Estore.findOne({
            _id: ObjectId(user.estoreid),
          }).exec();
          if (estore) {
            const randomNum = Math.floor(Math.random() * 100);
            const confirmText = {
              title: "Needs To Verify Your Account",
              body: "Please be reminded in order to fully use Gratis Clavstore, you need to verify your email address first",
              icon: "https://clavstoreimages.etnants.com/estore_images/gratis.png",
              tag: "verify-email" + randomNum,
              actions: [{ action: "access", title: "Verify Email" }],
              data: {
                url: "/" + estore.slug + "/user/account",
              },
            };
            sendPushNotification(JSON.parse(endP), confirmText);
          }
        }
      });
      if (cycleNotify >= 3) {
        cycleNotify = 1;
      } else {
        cycleNotify++;
      }
    });
  }, 64800000);
};

// 172800000
// 86400000
// 64800000

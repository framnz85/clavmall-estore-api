const push = require("web-push");

const vapidKeys = require("../config/webPushKeys.json");

push.setVapidDetails(
  "mailto:test@clavstore.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

exports.sendPushNotification = async (subscribe, dataText) => {
  let toBeReturned = false;
  await push
    .sendNotification(subscribe, JSON.stringify(dataText))
    .then(() => {
      toBeReturned = true;
    })
    .catch(() => {
      toBeReturned = false;
    });
  return toBeReturned;
};

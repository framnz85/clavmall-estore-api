const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const User = require("../../models/university/user");
const Loginreward = require("../../models/university/loginreward");
const Postreward = require("../../models/university/postreward");

const { sendPushNotification } = require("../../notification/webpush");

const dataText = {
    title: 'Yay a message.',
    body: 'We have received a push message.',
    icon: 'https://clavstoreimages.etnants.com/funnel_images/clavstoreuniversity.png',
    tag: 'simple-push-demo-notification-tag',
    actions: [
      {action: 'like', title: 'See Details'}
    ],
    data: {
      url: '/'
    }
}

exports.rewardDailyCheck = () => {
    const dateToday = new Date();
    setInterval(async () => {
        const users = await User.find({ $nor: [{ endPoint: { $exists: false } }, { endPoint: { $size: 0 } }] }, { "endPoint": 1 });
    
        users.forEach(async user => {
            const loginToday = await Loginreward.findOne({
                owner: ObjectId(user._id),
                rewardDate: dateToday.toDateString()
            }).exec();

            if (!loginToday) {
                const dataText = {
                    title: 'Claim your Login Reward now',
                    body: 'Your Login Reward for the day is ready. Access your account to claim it!',
                    icon: 'https://clavstoreimages.etnants.com/funnel_images/clavstoreuniversity.png',
                    tag: 'login-reward',
                    actions: [
                        {action: 'access', title: 'Access Account'}
                    ],
                    data: {
                        url: '/'
                    }
                }
                user.endPoint.forEach(endP => {
                    sendPushNotification(JSON.parse(endP), dataText);
                })
            }
                    
            const postToday = await Postreward.findOne({
                owner: ObjectId(user._id),
                rewardDate: dateToday.toDateString()
            }).exec();

            if (!postToday) {
                const dataText = {
                    title: 'Claim your Post Reward now',
                    body: 'Your Post Reward for the day is ready. Post a readymade post to your social media account to earn it!',
                    icon: 'https://clavstoreimages.etnants.com/funnel_images/clavstoreuniversity.png',
                    tag: 'post-reward',
                    actions: [
                        {action: 'access', title: 'View Instruction Here'}
                    ],
                    data: {
                        url: '/promote'
                    }
                }
                user.endPoint.forEach(endP => {
                    sendPushNotification(JSON.parse(endP), dataText);
                })
            }
        });
    }, 21600000);
};
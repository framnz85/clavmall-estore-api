const mongoose = require("mongoose");
const conn = require("../../dbconnect/allusers");

const notificationSchema = new mongoose.Schema(
  {
    title: String,
    body: String,
    icon: String,
    tag: String,
    actions: Array,
    data: Object,
    type: String,
  },
  { timestamps: true }
);

module.exports = conn.model("Notification", notificationSchema);

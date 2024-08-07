const mongoose = require("mongoose");

let conn;

try {
  conn = mongoose.createConnection(process.env.OGT_DATABASE);
  console.log(`DB CONNECTED TO ${process.env.OGT_DATABASE}`);
} catch (err) {
  console.log(`DB CONNECTION ERR ${err}`);
}

module.exports = conn;

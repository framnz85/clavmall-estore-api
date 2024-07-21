const mongoose = require("mongoose");

let conn;

try {
  conn = mongoose.createConnection(process.env.UNIVERSITY_DATABASE);
  console.log(`DB CONNECTED TO ${process.env.UNIVERSITY_DATABASE}`);
} catch (err) {
  console.log(`DB CONNECTION ERR ${err}`);
}

module.exports = conn;

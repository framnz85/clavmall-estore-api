const mongoose = require("mongoose");

let conn;

try {
  conn = mongoose.createConnection(process.env.PRIME_DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(`DB CONNECTED TO ${process.env.PRIME_DATABASE}`);
} catch (err) {
  console.log(`DB CONNECTION ERR ${err}`);
}

module.exports = conn;

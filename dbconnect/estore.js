const mongoose = require("mongoose");
const estoreid = require("./estoreid")

let conn={};

for (let i = 0; i < estoreid.length; i++) {
  try {
    conn[estoreid[i]] = mongoose.createConnection(`${process.env.ESTORE_DATABASE}/estore-${estoreid[i]}${process.env.ESTORE_DATABASE_EXT}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log(`DB CONNECTED TO ${process.env.ESTORE_DATABASE}/estore-${estoreid[i]}${process.env.ESTORE_DATABASE_EXT}`);
  } catch (err) {
    console.log(`DB CONNECTION ERR ${err}`);
  }
}

module.exports = conn;

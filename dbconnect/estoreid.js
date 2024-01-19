const estoreid1 = [];

const estoreid2 = [];

const estoreid3 = [
  "62c2d070f1598745f948c4dc",
  "613216389261e003d696cc65",
  "62f4281b57ad39377671d50b",
  "635f53d671b5b90016afad3e",
  "635fdc4ed86b29001671c128",
  "62fe4a8469a1930016df77b1",
  "6479bb7b4b4ac301748cda11",
  "64e5dd21a8a21ff4420bec55",
  "637c7e0f6b92d40016ca539d",
];

const estoreid = [
  {
    estore: estoreid1,
    database: process.env.ESTORE_DATABASE1,
    database_ext: process.env.ESTORE_DATABASE_EXT1,
  },
  {
    estore: estoreid2,
    database: process.env.ESTORE_DATABASE2,
    database_ext: process.env.ESTORE_DATABASE_EXT2,
  },
  {
    estore: estoreid3,
    database: process.env.ESTORE_DATABASE3,
    database_ext: process.env.ESTORE_DATABASE_EXT3,
  },
];

module.exports = estoreid;

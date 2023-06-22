const estoreid1 = [];

const estoreid2 = [];

const estoreid3 = [
  "62c2d070f1598745f948c4dc",
  "613216389261e003d696cc65",
  "62f4281b57ad39377671d50b",
  "6407b760e138066ea0f9f4cb",
  "635f53d671b5b90016afad3e",
  "635fdc4ed86b29001671c128",
  "636c703e6952b30016bf3517",
  "63c749f6e138066ea0f9dabe",
  "63df8a7ae138066ea0f9e4f9",
  "63e11219e138066ea0f9e5c2",
  "63f2c80ce138066ea0f9f002",
  "63f2d451e138066ea0f9f009",
  "62fe4a8469a1930016df77b1",
  "637f50d23f0a5c0016b86f94",
  "6479bb7b4b4ac301748cda11",
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

const estoreid1 = [
    "613216389261e003d696cc65", "62c2d017f1598745f948c4db", "62c2d070f1598745f948c4dc", "62f4281b57ad39377671d50b", "62fb503e52c205001636c6c1", "62fb443b87f9600016fb366a",
    "62fb4ef152c205001636c6bd", "62fb4ff552c205001636c6bf", "62fb57b552c205001636c6c8", "62fb7781e9316f0016197088", "62fc85a665f7c70016f85b1f", "62fce72d306f4a00160ca283",
    "62fe4a8469a1930016df77b1", "6301ea974aba920016183c3e", "63020e6f63a767001612ada5", "63037ea1899137001636e19e", "63218c93c621720f9982975d", "6329506a7febd2001612603c",
    "6328746deadc4c00169e86ab", "63286fcbeadc4c00169e86a9", "6349794d1690f30016b41c42", "6350f43888f1f20016356ddc", "634cc39245a6fd00167a0245", "634c1ba2fc2e5a00168989a6",
    "634bd7434ef49f00169ab419", "6357d6dc96471e0016d7ce09", "63563b48526ac40016d3ba22", "635632a22dc7a60016a137a9", "6353e753cd4e15001688d4ae", "63618d0a06d3cc0016aaae47",
    "635fe8ebb4d2ce00160f2b55", "635fdc4ed86b29001671c128", "635f53d671b5b90016afad3e", "635f2ce025e72f001653fd2a", "635f07279577d300167a1a18", "6368c64016796b0016cc347f",
    "6368ef121fb2750016d567a7", "6368f08e1fb2750016d567aa", "6369021d1fb2750016d567ba", "63696f8cfb6c2500165335a1", "636c703e6952b30016bf3517", "6374e050ab817e00165d835c",
    "637249df1b833700166100a6", "637f7e113a47ce001629331c", "637f50d23f0a5c0016b86f94", "637c7e0f6b92d40016ca539d", "637b3f96256411001649d707"
]

const estoreid2 = [
    "6388b96552613f09da060281", "6386d47552613f09da06022e", "6384c83252613f09da0601e7", "6384443f52613f09da0601ba", "638f52f852613f09da0605e1", "638dd02a52613f09da060518",
    "638d937a52613f09da060503", "638d786752613f09da0604ed", "638d464b52613f09da0604d8", "63944e1be138066ea0f9c870", "6396ed6ce138066ea0f9cabf", "63a247dde138066ea0f9cf46",
    "63a1d0ffe138066ea0f9cf2e", "63a116f6e138066ea0f9ced9", "639fea10e138066ea0f9ce8a", "639fe244e138066ea0f9ce87", "639fb6f1e138066ea0f9ce7b", "639f9b6de138066ea0f9ce6e",
    "63a67d58e138066ea0f9d0c8", "63ab08b6e138066ea0f9d311", "63a8f062e138066ea0f9d210", '63b22b79e138066ea0f9d47a', "63c749f6e138066ea0f9dabe", "63c50a7fe138066ea0f9d9e6",
    "63c4200fe138066ea0f9d9ae", "63cfebdbe138066ea0f9dee3", "63ce6719e138066ea0f9ddd6", "63ce29f9e138066ea0f9ddb8"
]

const estoreid = [
    {
        estore: estoreid1,
        database: process.env.ESTORE_DATABASE1,
        database_ext: process.env.ESTORE_DATABASE_EXT1
    },
    {
        estore: estoreid2,
        database: process.env.ESTORE_DATABASE2,
        database_ext: process.env.ESTORE_DATABASE_EXT2
    }
]

module.exports = estoreid;
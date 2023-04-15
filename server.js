const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { readdirSync } = require("fs");
require("dotenv").config();

const { rewardDailyCheck } = require("./controllers/university/rewards");

const app = express();

rewardDailyCheck();

app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(cors());

readdirSync("./routes").map((route) =>
  app.use("/api", require("./routes/" + route))
);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

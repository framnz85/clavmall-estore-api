const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { readdirSync } = require("fs");
require("dotenv").config();

// const { rewardDailyCheck } = require("./controllers/university/rewards");
const { gratisWebPush } = require("./controllers/gratis/webpush");

const app = express();

// rewardDailyCheck();
gratisWebPush();

app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(cors());

readdirSync("./routes").map((route) =>
  readdirSync("./routes/" + route).map((file) =>
    app.use("/api", require("./routes/" + route + "/" + file))
  )
);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

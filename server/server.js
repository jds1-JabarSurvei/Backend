const express = require("express");
var cors = require("cors");
const apiRouter = require("./routes");

const app = express();

app.use(express.json());

var whitelist = ["http://localhost:3000"];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use("/", cors(corsOptions), apiRouter);

app.listen(process.env.PORT || "5000", () => {
  console.log(`Server is running on port: ${process.env.PORT || 5000}`);
});

const express = require("express");
const fileUpload = require("express-fileupload");
// var cors = require("cors");
const apiRouter = require("./routes");

const app = express();

app.use(express.json());

//SETUP ALLOW CORS POLICY
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/", apiRouter);

module.exports = app;

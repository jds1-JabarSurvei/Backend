const express = require("express");
var cors = require("cors")
const fileUpload = require("express-fileupload");
// var cors = require("cors");
const apiRouter = require("./routes");

const app = express();
app.use(cors());
app.use(express.json());

// var corsOptions = {
//   origin: 'https://polar-tundra-59366.herokuapp.com/',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }
//SETUP ALLOW CORS POLICY
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "https://polar-tundra-59366.herokuapp.com/");
//   res.header("Access-Control-Allow-Credentials", true);
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });
app.use(cors());
app.use("/", apiRouter);

module.exports = app;

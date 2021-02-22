const express = require("express");
// var cors = require("cors");
const apiRouter = require("./routes");

const app = express();

app.use(express.json());

// var whitelist = ["http://localhost:3000"];
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
// };

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

app.listen(process.env.PORT || "5000", () => {
  console.log(`Server is running on port: ${process.env.PORT || 5000}`);
});

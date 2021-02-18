const express = require("express");
const db = require("../db");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const router = express.Router();

// async function testDecryptPass() {
//   let hashed = "$2b$10$7bmyGlfIyzk9a35vtLYnnuMh6Q37gPGGX/M.JK1/LCwtGHMIa0Key";
//   let test = await bcrypt.compare("pass5", hashed);
//   if (test) {
//     console.log("Decrypting with bcrypt works!!");
//   } else {
//     console.log("Decrypting with bcrypt fails!!");
//   }
// }

// testDecryptPass();

router.post("/register", async (req, res, next) => {
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;

  try {
    let hash = await bcrypt.hash(password, saltRounds);
    let results = await db.register(email, username, hash);
    res.json(results);
  } catch (e) {
    console.log(e.sqlMessage.split(" ").slice(-1));
    if (e.sqlMessage.split(" ").slice(-1)[0] === "'user.username_UNIQUE'") {
      res.send({ error: "Username has been taken" });
    } else if (e.sqlMessage.split(" ").slice(-1)[0] === "'user.email_UNIQUE'") {
      res.send({ error: "Email has been taken" });
    } else {
      res.sendStatus(500);
    }
  }
});

router.get("/api/login", async (req, res, next) => {
  try {
    let results = await db.all();
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = router;

const express = require("express");
const db = require("../db");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const router = express.Router();

router.post("/register", async (req, res, next) => {
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;

  try {
    let hash = await bcrypt.hash(password, saltRounds);
    let results = await db.register(email, username, hash);
    res.json(results);
  } catch (e) {
    if (
      e.code === "ER_DUP_ENTRY" &&
      e.sqlMessage.split(" ").slice(-1)[0] === "'user.username_UNIQUE'"
    ) {
      res.send({ error: "Username has been taken" });
    } else if (
      e.code === "ER_DUP_ENTRY" &&
      e.sqlMessage.split(" ").slice(-1)[0] === "'user.email_UNIQUE'"
    ) {
      res.send({ error: "Email has been taken" });
    } else {
      console.log(e);
      res.sendStatus(500);
    }
  }
});

router.post("/login", async (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  try {
    let results = await db.login(email);
    let test = await bcrypt.compare(password, results[0].password);

    if (test) {
      res.json({ email: email, role: results[0].role, login: "Success" });
    } else {
      res.json({ email: email, login: "Failed" });
    }
  } catch (e) {
    if (e.message === "Cannot read property 'password' of undefined") {
      res.json({ email: email, login: "Failed" });
    } else {
      res.sendStatus(500);
    }
  }
});

router.get("/test", async (req, res, next) => {
  try {
    let results = await db.all();
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = router;

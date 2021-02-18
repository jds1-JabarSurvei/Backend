const express = require("express");
const db = require("../db");
const router = express.Router();

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

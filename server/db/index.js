const mysql = require("mysql");

const dotenv = require("dotenv").config();
const pool = mysql.createPool({
  connectionLimit: 10,
  password: process.env.DATABASE_PASSWORD,
  user: process.env.DATABASE_USER,
  host: "localhost",
  port: "3306",
  database: process.env.DATABASE_NAME,
});

console.log(process.env.DATABASE_PASSWORD);

let db = {};

db.all = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM user", (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};


db.register = (email, username, password) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO user (email, username, password) VALUES(?, ?, ?)`,
      [email, username, password],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
  });
};

module.exports = db;

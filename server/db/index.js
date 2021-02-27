const mysql = require("mysql");

const dotenv = require("dotenv").config();
const pool = mysql.createPool({
  connectionLimit: 1000,
  connectTimeout: 60 * 60 * 1000,
  acquireTimeout: 60 * 60 * 1000,
  timeout: 60 * 60 * 1000,
  password: process.env.DATABASE_PASSWORD,
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
});

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
      `INSERT INTO user (email, username, password, role) VALUES(?, ?, ?, "user")`,
      [email, username, password],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.login = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT email,password,role FROM user WHERE email = ?;`,
      [email],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

module.exports = db;

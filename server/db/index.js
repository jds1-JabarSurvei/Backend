const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 10,
  password: "Password_23",
  user: "root",
  database: "new_schema",
  host: "localhost",
  port: "3306",
});

let db = {};

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
      }
    );
  });
};

module.exports = db;

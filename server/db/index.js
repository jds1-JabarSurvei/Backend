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

db.insert_form = (id_pembuat, nama_form) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO form (id_pembuat, nama_form) VALUES(?, ? )`,
      [id_pembuat, nama_form],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.insert_form_section = (id_form, id_bagian,judul,deskripsi) => { 
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO form (id_form, id_bagian,judul,deskripsi) VALUES(?, ?, ?, ? )`,
      [id_form, id_bagian,judul,deskripsi],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.insert_pertanyaan = (id_form, bagian,urutan,pertanyaan,tipe,deskripsi,required) => { // db form field
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO form_field (id_form, bagian,urutan,pertanyaan,tipe,deskripsi,required) 
      VALUES(?, ?, ?, ?, ?, ?, ? )`,
      [id_form, bagian,urutan,pertanyaan,tipe,deskripsi,required],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.insert_pertanyaan_pilihan = (id_form_field, nama, nilai, urutan) => { // db form field option
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO form_field (id_form_field, nama, nilai, urutan) 
      VALUES(?, ?, ?, ?)`,
      [id_form_field, nama, nilai, urutan],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.insert_form_bagian
db.insert_hasil_form = (id_form) => { // db form field option
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO form_field (id_form) VALUES(?)`,
      [id_form],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.insert_jawaban_pertanyaan = (id_form_result, id_form_field, id_form_option, value) => { // db form field result
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO form_result (id_form_result, id_form_field, id_form_option, value) 
      VALUES(?, ?, ?, ?)`,
      [id_form_result, id_form_field, id_form_option, value],
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

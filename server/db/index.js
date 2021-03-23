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
  /*Ini cuman untuk testing aja dipanggil buat mengecek koneksi ke DB*/
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM user", (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

db.register = (email, username, password, contactNumber, gender, address, birthday) => {
  /*MySQL query untuk menambahkan user baru ke dalam tabel user */
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO user (email, username, password, role, contactNumber, gender, address, birthday) VALUES(?, ?, ?, "admin", ?, ?, ?, ?)`,
      [email, username, password, contactNumber, gender, address, birthday],
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
  /*MySQL query untuk mendapatkan data-data user dengan email tertentu*/
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

db.getFormFields = (idForm) => {
  /*MYSQL query untuk mendapatkan semua field dari suatu form*/
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT * from form inner join form_field using(id_form) where id_form=?;`,[idForm],
      (err, result) => {
        if (err){
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.getFormFieldOption = (id_form_field) => {
  /*MYSQL query untuk mendapatkan semua opsional dari pertanyaan bertipe option*/
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT * from form_field_option where id_form_field=?;`, [id_form_field],
      (err, result) => {
        if(err){
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.getSectionDescription = (id_form, id_bagian) => {
  /*MySQL query untuk mendapatkan deskripsi dari suatu section */
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT deskripsi from form_section where id_form=? and id_bagian=?;`, [id_form, id_bagian],
      (err, result) => {
        if(err){
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.getFormEachResponse = (id_form, id_form_response) => {
  /*Mendapatkan respons dengan id respons tertentu dari form dengan id tertentu */
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT * from form_result join form_field_value using(id_form_result, id_response) join form_field using(id_form, id_form_field) where id_form=? and id_response=?;`,[id_form, id_form_response],
      (err, result) => {
        if(err){
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.getFormAllResultIds = (id_form) => {
  /*Mendapatkan semua id respons dari sebuah form dengan id tertentu */
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT distinct id_response from form_result where id_form=?;`,[id_form],
      (err, result) => {
        if(err){
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.getFormInfo = (idForm) => {
  /*Mendapatkan informasi dari sebuah form dengan id tertentu */
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT * from form where id_form=?;`,[idForm],
      (err, result) => {
        if(err){
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.getUserInfo = (userID) => {
  /* Mendapatkan data-data general dari seorang user dengan userID tertentu*/
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT username, contactNumber, gender, address from user where id=?;`,[userID],
      (err, result) => {
        if(err){
          return reject(err);
        }
        return resolve(result);
      }
    )
  })
}

db.getListOfForms = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT * from form`,
      (err, result) => {
        if(err){
          return reject(err);
        }
        return resolve(result);
      }
    )
  })
}

module.exports = db;

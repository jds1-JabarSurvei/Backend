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
      `SELECT * from form_section where id_form=? and id_bagian=?;`, [id_form, id_bagian],
      (err, result) => {
        if(err){
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.getFormEachResponse = (id_form_result) => {
  /*Mendapatkan respons dengan id respons tertentu dari form dengan id tertentu */
  return new Promise((resolve, reject) => {
    pool.query(
      `select id_form, table1.id_form_result, id_pembuat, nama_form, form_field.id_form_field, bagian, urutan, pertanyaan, tipe, deskripsi, required, id_form_field_value, id_form_option, value from ((select * from  form_result join form using (id_form) where id_form_result=?) as table1 join form_field using (id_form)) left join form_field_value on (table1.id_form_result = form_field_value.id_form_result and form_field.id_form_field=form_field_value.id_form_field);`,[id_form_result],
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
      `SELECT id_form_result from form_result where id_form=?;`,[id_form],
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

db.getListOfMatchedForms = (titleSubstring) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT * from form where nama_form like ?;`,["%" + titleSubstring + "%"],
      (err, result) => {
        if(err){
          return reject(err);
        }
        return resolve(result);
      }
    )
  })
}


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

db.insert_form_section = (id_form, id_bagian, judul, deskripsi) => { // db form field
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO form_section (id_form, id_bagian, judul, deskripsi) 
      VALUES(?, ?, ?, ? )`,
      [id_form, id_bagian, judul, deskripsi],
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

db.insert_pertanyaan_pilihan = (id_form_field, nilai, urutan) => { // db form field option
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO form_field_option (id_form_field, nilai, urutan) 
      VALUES(?, ?, ?)`,
      [id_form_field,nilai, urutan],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.insert_hasil_form = (id_form) => { // db form field option
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO form_result (id_form) VALUES(?)`,
      [id_form],
      (err, result) => {
        if(err){
          return reject(err);
        }
        return resolve(result);
      }
    )
  })
}


db.insert_jawaban_pertanyaan = (id_form_result, id_form_field, id_form_option, value) => { // db form field result
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO form_field_value (id_form_result, id_form_field, id_form_option, value) 
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

db.delete_form = (id_form) => { // db form field result
  return new Promise((resolve, reject) => {
    pool.query(
      `DELETE FROM form where id_form = ?`,
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

db.delete_response = (id_form,id_response) => { // db form field result
  return new Promise((resolve, reject) => {
    pool.query(
      `DELETE FROM form_result where id_form = ? AND id_response = ?`,
      [id_form, id_response],
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

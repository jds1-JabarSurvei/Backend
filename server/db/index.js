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
      `SELECT * from form inner join form_field using(id_form) where id_form=? and form_field.isdeleted is null;`,[idForm],
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
      `SELECT * from form_field_option where id_form_field=? and isdeleted is null;`, [id_form_field],
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
      `SELECT * from form_section where id_form=? and id_bagian=? and isdeleted is null;`, [id_form, id_bagian],
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
      `select id_form, table1.id_form_result, id_pembuat, nama_form, form_field.id_form_field, bagian, urutan, pertanyaan, tipe, deskripsi, required, id_form_field_value, id_form_option, value from (select * from  form_result join form using (id_form) where id_form_result=?) as table1 join form_field using (id_form) left join form_field_value on (table1.id_form_result = form_field_value.id_form_result and form_field.id_form_field=form_field_value.id_form_field) where form_field.isdeleted is null;`,[id_form_result],
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
      `SELECT * from form where isdeleted is null;`,
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
      `SELECT * from form where nama_form like ? and isdeleted is null;`,["%" + titleSubstring + "%"],
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

db.insert_pertanyaan = (id_form, bagian, urutan, pertanyaan, tipe, deskripsi, required) => { // db form field
  // console.log("Ini nilai requiredd");
  // console.log(required);
  // console.log("Ini nilai requiredd");
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
      `UPDATE form SET isdeleted="1" where id_form=?`,
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

db.update_form_info = (id_form, new_title) => {
  // console.log("Update form info dipanggil");
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE form SET nama_form=?, isdeleted=NULL WHERE id_form=?`,
      [new_title, id_form],
      (err, result) => {
        if(err){
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.update_form_section = (id_form, id_bagian, new_title, new_description) => {
  // console.log("Update form section dipanggil");
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT id_section from form_section WHERE id_form=? AND id_bagian=?;`,
      [id_form, id_bagian],
      (err, result) => {
        if(err){
          return reject(err);
        }
        let id_section = null;
        if(result && result[0] && result[0].id_section){
          id_section = result[0].id_section;
        }
        if(id_section){
          //Bagian sudah ada sebelumnya
          pool.query(
            `UPDATE form_section SET judul=?, deskripsi=?, isdeleted=NULL WHERE id_section=?`,
            [new_title, new_description, id_section],
            (err, result) => {
              if(err){
                return reject(err);
              }
              return resolve(result);
            }
          );
        }
        else{
          //Menambah bagian baru
          pool.query(
            `INSERT INTO form_section (id_form, id_bagian, judul, deskripsi) VALUES(?, ?, ?, ?)`,
            [id_form, id_bagian, new_title, new_description],
            (err, result) => {
              if(err){
                return reject(err);
              }
              return resolve(result);
            }
          );
        }
      }
    )
  })
  
};

db.getFormFieldId = (id_form, bagian, urutan) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT id_form_field from form_field WHERE id_form=? AND bagian=? AND urutan=?`, 
      [id_form, bagian, urutan],
      (err, result) => {
        if(err){
          return reject(err);
        }
        else{
          return resolve(result);
        }
    })
  })
}

db.getAllFormResponseID = (id_form) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT id_form_result as response_id from form_result where id_form=?',
      [id_form],
      (err, result) => {
        if(err){
          return reject(err);
        }
        else{
          let resultArray = result.map((obj) => obj.response_id);
          return resolve(resultArray);
        }
      }
    )
  })
}

db.getFormFieldValue = (id_form_field) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT id_form_result as response_id, value as jawaban from form_field_value where id_form_field=?',
      [id_form_field],
      (err, result) => {
        if(err){
          return reject(err);
        }
        else{
          return resolve(result);
        }
      }
    )
  })
}

db.update_form_field = (id_form_field, new_pertanyaan, new_tipe, new_deskripsi, new_required) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE form_field SET pertanyaan=?, tipe=?, deskripsi=?, required=?, isdeleted=NULL WHERE id_form_field=?`,
      [new_pertanyaan, new_tipe, new_deskripsi, new_required, id_form_field],
      (err, result) => {
        if(err){
          return reject(err);
        }
        else{
          return resolve("Update form field berhasil");
        }
      }
    )
  })
}

db.get_form_field_option_id = (id_form_field, urutan) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT id_form_field_option FROM form_field_option WHERE id_form_field=? AND urutan=?',
      [id_form_field, urutan],
      (err, result) => {
        if(err){
          return reject(err);
        }
        else{
          return resolve(result);
        }
      }
    )
  })
}

db.update_form_field_option = (id_form_field_option, newValue, urutan) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'UPDATE form_field_option SET nilai=?, isdeleted=NULL where id_form_field_option=? and urutan=?;',
      [newValue, id_form_field_option, urutan],
      (err, result) => {
        if(err){
          return reject(err);
        }
        else{
          return resolve(result);
        }
      }
    )
  })
}

db.get_highest_urutan_option = (id_form_field) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'select urutan from form_field_option where id_form_field=? order by urutan desc limit 0,1;',
      [id_form_field],
      (err, result) => {
        if(err){
          return reject(err)
        }
        else{
          return resolve(result)
        }
      }
    )
  })
}

db.get_highest_urutan_pertanyaan = (id_form, bagian) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'select urutan from form_field where id_form=? and bagian=? order by urutan desc limit 0,1;',
      [id_form, bagian],
      (err, result) => {
        if(err){
          return reject(err)
        }
        else{
          return resolve(result)
        }
      }
    )
  })
}

db.get_highest_form_bagian = (id_form) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'select id_bagian from form_section where id_form=? order by id_bagian desc limit 0,1;',
      [id_form],
      (err, result) => {
        if(err){
          return reject(err);
        }
        else{
          return resolve(result);
        }
      }
    )
  })
}

db.soft_delete_option = (id_form_field, urutan) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'update form_field_option set isdeleted="1" where id_form_field=? and urutan=?;',
      [id_form_field, urutan],
      (err, result) => {
        if(err){
          return reject(err);
        }
        else{
          return resolve(result);
        }
      }
    )
  })
}

db.soft_delete_pertanyaan = (id_form, bagian, urutan) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'update form_field set isdeleted="1" where id_form=? and bagian=? and urutan=?;',
      [id_form, bagian, urutan],
      (err, result) => {
        if(err){
          return reject(err);
        }
        else{
          return resolve(result);
        }
      }
    )
  })
}

db.soft_delete_bagian = (id_form, bagian) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'update form_section set isdeleted="1" where id_form=? and id_bagian=?;',
      [id_form, bagian],
      (err, result) => {
        if(err){
          return reject(err);
        }
        else{
          return resolve(result);
        }
      }
    )
  })
}


db.insert_form_image = (filename, path, id_form) => { // db form field result
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO form_image (filename, path, id_form) 
      VALUES(?, ?, ?)`,
      [filename, path, id_form],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

db.getPathImages = (id_form) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT filename,path from form_image where id_form = ?;`,[id_form],
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

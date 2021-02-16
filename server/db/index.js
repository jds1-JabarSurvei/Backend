const mysql = require('mysql');
const dotenv = require('dotenv').config();
const pool = mysql.createPool({
    connectionLimit: 10,
    password: process.env.DATABASE_PASSWORD,
    user: process.env.DATABASE_USER,
    host:'localhost',
    port: '3306',
    database : process.env.DATABASE_NAME
})

let db= {};

db.all = () => {  
    return new Promise((resolve,reject) => {
        pool.query('SELECT * FROM login',(err, results) =>{
            if(err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

module.exports = db;
const bcrypt = require("bcrypt");
const db = require("../db");
const jwt = require('jsonwebtoken');
require('dotenv').config()

const saltRounds = 10;

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

// Verify JWT Token
exports.verifyToken = async (req, res, next) => {
    const jdsToken = req.cookies.jds || '';
    console.log(jdsToken);
    next();
}

// Get All User
exports.findAll = async (req, res) => {
    try {
        let results = await db.all();
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
}

// Register a user
exports.register = async (req, res) => {
    /*POST request untuk meregister user baru sesuai parameter body*/
    let email = req.body.email;
    let username = req.body.email.split("@")[0];
    let password = req.body.password;
    let contactNumber = req.body.contactNumber;
    let gender = req.body.gender;
    let address = req.body.address;
    let birthday = req.body.birthday;
    // res.download()
    try {
        let hash = await bcrypt.hash(password, saltRounds);
        let results = await db.register(email, username, hash, contactNumber, gender, address, birthday);
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
}

// Login
exports.login = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    try {
        let results = await db.login(email);
        let test = await bcrypt.compare(password, results[0].password);

        if (test) {
            let token = generateAccessToken({ "username": results[0].username, "email": "email", "role": results[0].role, "id": results[0].id });
            res.cookie('jds', token, {
                maxAge: 60 * 60 * 24 * 7,
                httpOnly: false
            });
            res.json({ "login": "Success" });
        } else {
            res.json({ "email": email, "login": "Failed" });
        }
    } catch (e) {
        console.log(e)
        if (e.message === "Cannot read property 'password' of undefined") {
            res.json({ "email": email, "login": "Failed" });
        } else {
            res.sendStatus(500);
        }
    }
}
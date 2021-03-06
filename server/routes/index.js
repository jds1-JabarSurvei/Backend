const express = require("express");
const db = require("../db");
const bcrypt = require("bcrypt");
const nodemon = require("nodemon");
const saltRounds = 10;

const router = express.Router();

router.post("/register", async (req, res, next) => {
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;

  try {
    let hash = await bcrypt.hash(password, saltRounds);
    let results = await db.register(email, username, hash);
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
});

router.post("/login", async (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  try {
    let results = await db.login(email);
    let test = await bcrypt.compare(password, results[0].password);

    if (test) {
      res.json({ email: email, role: results[0].role, login: "Success" });
    } else {
      res.json({ email: email, login: "Failed" });
    }
  } catch (e) {
    if (e.message === "Cannot read property 'password' of undefined") {
      res.json({ email: email, login: "Failed" });
    } else {
      res.sendStatus(500);
    }
  }
});

router.get("/test", async (req, res, next) => {
  try {
    let results = await db.all();
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.get("/formQuestions/:formID", async(req, res, next) => {
  try{
    let results = await db.getFormQuestion(req.params.formID);
    let firstResult = results[0];
    let returnResult={};
    returnResult.form_id= req.params.formID;
    returnResult.pembuat = firstResult.id_pembuat;
    let bagianArray=[]
    for (let i=0 ; i<results.length; i++){
      let option=[];
      if(results[i].tipe == "option"){
        let options = await db.getFormFieldOption(results[i].id_form_field);
        for(let i=0; i<options.length; i++){
          option.push({[options[i].nama]: options[i].nilai});
        }
      }
      if(bagianArray[results[i].bagian]){
        //bagian sudah ada sebelumnya
        //tambahkan pertanyaan
        bagianArray[results[i].bagian].pertanyaan.push({
          pertanyaan: results[i].pertanyaan,
          tipe: results[i].tipe,
          option: option
        })
      }
      else{
        //bagian belum ada sebelumnya
        let sectionDescriptionsResult = await db.getSectionDescription(req.params.formID,results[i].bagian);
        let temp = {
          judul: `BAGIAN ${results[i].bagian+1}`,
          deskripsi: null,
          pertanyaan: [{
            pertanyaan: results[i].pertanyaan,
            tipe: results[i].tipe,
            option: option
          }]
        };
        if(sectionDescriptionsResult[0] && sectionDescriptionsResult[0].deskripsi){
          temp["deskripsi"] = sectionDescriptionsResult[0].deskripsi;
        }
        bagianArray.push(temp);
      }
    }
    returnResult.pertanyaan = bagianArray;

    res.json(returnResult);
  }
  catch(e){
    console.log(e);
  }
})


// router.get("/formFieldOption/:id_form_field", async(req, res, next) => {
//   try{
//     let results = await db.getFormFieldOption(req.params.id_form_field);
//     console.log(results);
//     res.json(results);
//   }
//   catch(e){
//     console.log(e);
//   }

// }

module.exports = router;

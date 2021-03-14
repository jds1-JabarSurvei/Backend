const express = require("express");
const db = require("../db");
const bcrypt = require("bcrypt");
const nodemon = require("nodemon");
const { insert_form } = require("../db");
const saltRounds = 10;

const router = express.Router();

router.post("/register", async (req, res, next) => {
  /*POST request untuk meregister user baru sesuai parameter body*/
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
  /*POST request untuk login user baru mereturn sukses(berhasil login) atau failed(gagal login)*/
  let email = req.body.email;
  let password = req.body.password;

  try {
    let results = await db.login(email);
    let test = await bcrypt.compare(password, results[0].password);

    if (test) {
      res.json({ "email": email, "role": results[0].role, "login": "Success" });
    } else {
      res.json({ "email": email, "login": "Failed" });
    }
  } catch (e) {
    if (e.message === "Cannot read property 'password' of undefined") {
      res.json({ "email": email, "login": "Failed" });
    } else {
      res.sendStatus(500);
    }
  }
});


router.get("/formQuestions/:formID", async(req, res, next) => {
  /*GET REQUEST untuk mendapatkan list pertanyaan yang akan diisi oleh responden */
  try{
    let results = await db.getFormFields(req.params.formID);
    let firstResult = results[0];
    let returnResult={};
    returnResult.form_id= req.params.formID;
    let dataPembuat = await db.getUserInfo(firstResult.id_pembuat);
    returnResult.pembuat = dataPembuat[0].username;
    returnResult.judulForm = firstResult.nama_form;
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
          urutan: results[i].urutan,
          tipe: results[i].tipe,
          option: option
        })
      }
      else{
        //bagian belum ada sebelumnya
        let sectionDescriptionsResult = await db.getSectionDescription(req.params.formID,results[i].bagian);
        let temp = {
          judul: `BAGIAN ${results[i].bagian+1}`,
          bagian: results[i].bagian,
          deskripsi: null,
          pertanyaan: [{
            pertanyaan: results[i].pertanyaan,
            urutan: results[i].urutan,
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

router.get("/formResponse/:formID/:responseID", async(req, res, next) => {
  /*GET request untuk mendapatkan pertanyaan serta jawaban dari suatu respon dari suatu form*/
  try{
    let formInfo = await db.getFormInfo(req.params.formID);
    let results = await db.getFormEachResponse(req.params.formID, req.params.responseID);
    let returnResult={};
    returnResult.form_id= req.params.formID;
    let dataPembuat = await db.getUserInfo(formInfo[0].id_pembuat);
    returnResult.pembuat = dataPembuat[0].username;
    returnResult.judulForm = formInfo[0].nama_form;
    returnResult.response_id=req.params.responseID;
    let bagianArray=[];
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
        bagianArray[results[i].bagian].response.push({
          pertanyaan: results[i].pertanyaan,
          urutan: results[i].urutan,
          tipe: results[i].tipe,
          option: option,
          value: results[i].value
        })
      }
      else{
        //bagian belum ada sebelumnya
        let sectionDescriptionsResult = await db.getSectionDescription(req.params.formID,results[i].bagian);
        let temp = {
          judul: `BAGIAN ${results[i].bagian+1}`,
          bagian: results[i].bagian,
          deskripsi: null,
          response: [{
            pertanyaan: results[i].pertanyaan,
            urutan: results[i].urutan,
            tipe: results[i].tipe,
            option: option,
            value: results[i].value
          }]
        };
        if(sectionDescriptionsResult[0] && sectionDescriptionsResult[0].deskripsi){
          temp["deskripsi"] = sectionDescriptionsResult[0].deskripsi;
        }
        bagianArray.push(temp);
      }
    }
    returnResult.responses = bagianArray;

    res.json(returnResult);
  }
  catch(e){
    console.log(e);
    res.sendStatus(500);
  }
})

router.get("/listOfForms", async(req, res, next) => {
  /*Get Request untuk mendapatkan list semua form yang ada */
  let user=[];
  let returnResult=[];
  try{
    let formsList = await db.getListOfForms();
    for(let i=0; i<formsList.length; i++){
      let temp={};
      temp.idForm = formsList[i].id_form;
      temp.namaForm = formsList[i].nama_form;
      if(!user[formsList[i].id_pembuat]){
        user[formsList[i].id_pembuat] = (await db.getUserInfo(formsList[i].id_pembuat))[0].username;
      } 
      temp.pembuat = user[formsList[i].id_pembuat];
      returnResult.push(temp);
    }
    res.send(returnResult);
  }
  catch(e){
    console.log(e);
    res.sendStatus(500);
  }
})

router.post("/buatform", async (req, res, next) => {
  let id_pembuat = req.body.user_id;
  let nama_form = req.body.judulForm;
  let bagianArray = req.body.bagian;

  try {
    let id_form = await db.insert_form(id_pembuat,nama_form);
    id_form = id_form['insertId'];
    let section = 0;
    for (var numbagian in bagianArray){
      let bagian = bagianArray[numbagian];
      let pertanyaan_order=0;
      await db.insert_form_section(id_form,section,bagian["judul"],bagian["deskripsi"]);
      if(bagian["pertanyaan"]){
        for (var numpertanyaan in bagian["pertanyaan"]){
          let pertanyaan = bagian["pertanyaan"][numpertanyaan];
          let id_form_field = await db.insert_pertanyaan(
            id_form,
            section,
            pertanyaan_order,
            pertanyaan["pertanyaan"],
            pertanyaan["tipe"],
            pertanyaan["deskripsi"],
            pertanyaan["required"]);
          if(pertanyaan["option"]){
            let option_order =0;
            for (var numoption in pertanyaan["option"]){
              let option = pertanyaan["option"][numoption];
              await db.insert_pertanyaan_pilihan(
                id_form_field["insertId"],option["nilai"],option_order);
              option_order++;
            }            
          }
          pertanyaan_order++;
        }
      }
      section++;  
    }
    res.json({"status":"success","id_form":id_form});
  } catch (e) {
      console.log(e);
      res.sendStatus(500);
  }
});

router.post("/submitjawaban", async (req, res, next) => {
  try{
    let id_form = req.body.id_form;
    let jawaban = req.body.jawaban;
    let id_res = await db.insert_hasil_form(id_form);
    id_res = id_res["insertId"]
    for (var numjawaban in jawaban){
      let ans = jawaban[numjawaban];
      await db.insert_jawaban_pertanyaan(id_res,ans["id_form_field"],ans["id_form_option"],ans["value"]);
    }
    res.json({"id_res":id_res,"status":"success"});
  }catch (e){
    console.log(e);
    res.sendStatus(500);
  }
});


router.get("/all", async (req, res, next) => {

  try {
    let results = await db.all();
    res.json(results);
  } catch (e) {
      console.log(e);
      res.sendStatus(500);
  }
});

module.exports = router;

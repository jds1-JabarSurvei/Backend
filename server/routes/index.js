const express = require("express");
const db = require("../db");
const bcrypt = require("bcrypt");
const nodemon = require("nodemon");
const { insert_form } = require("../db");
const saltRounds = 10;
const fileUpload = require('express-fileupload');
const path = require('path');
const router = express.Router();
const uploader = router.use(fileUpload());

router.post("/register", async (req, res, next) => {
  /*POST request untuk meregister user baru sesuai parameter body*/
  let email = req.body.email;
  let username = req.body.email.split("@")[0];
  let password = req.body.password;
  let contactNumber = req.body.contactNumber;
  let gender = req.body.gender;
  let address = req.body.address;
  let birthday = req.body.birthday;

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
    returnResult.id_form= req.params.formID;
    let dataPembuat = await db.getUserInfo(firstResult.id_pembuat);
    returnResult.pembuat = dataPembuat[0].username;
    returnResult.judulForm = firstResult.nama_form;
    let bagianArray=[]
    for (let i=0 ; i<results.length; i++){
      let option=[];
      if(results[i].tipe == "radio" || results[i].tipe == "checkbox"){
        let options = await db.getFormFieldOption(results[i].id_form_field);
        for(let i=0; i<options.length; i++){
          option.push({nilai: options[i].nilai, id_form_option: options[i].id_form_field_option});
        }
      }
      if(bagianArray[results[i].bagian]){
        //bagian sudah ada sebelumnya
        //tambahkan pertanyaan
        bagianArray[results[i].bagian].pertanyaan.push({
          pertanyaan: results[i].pertanyaan,
          id_form_field: results[i].id_form_field,
          deskripsi: results[i].deskripsi,
          required: results[i].required,
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
            id_form_field: results[i].id_form_field,
            deskripsi: results[i].deskripsi,
            required: results[i].required,
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

router.get("/formResponseIds/:formID", async(req, res, next) => {
  /**Mendapatkan semua response id untuk form dengan id formID*/
  try{
    let resultArray=[];
    let result = await db.getFormAllResultIds(req.params.formID);
    for(let i=0; i<result.length; i++){
      resultArray.push(result[i].id_form_result);
    }
    res.json(resultArray);
  }
  catch(e){
    console.log(e);
  }
})

async function getSpecificResponse(idResponse){
  /**Mendapatkan specific respons dengan idResponse tertentu */
  try{
    let results = await db.getFormEachResponse(idResponse);
    let formInfo = await db.getFormInfo(results[0].id_form);
    let returnResult={};
    returnResult.id_form= results[0].id_form;
    let dataPembuat = await db.getUserInfo(formInfo[0].id_pembuat);
    returnResult.pembuat = dataPembuat[0].username;
    returnResult.judulForm = formInfo[0].nama_form;
    returnResult.response_id=idResponse;
    let bagianArray=[];
    let formField={};
    for (let i=0 ; i<results.length; i++){
      let option=[];
      if(results[i].tipe == "radio" || results[i].tipe == "checkbox"){
        let options = await db.getFormFieldOption(results[i].id_form_field);
        for(let i=0; i<options.length; i++){
          option.push({nilai: options[i].nilai});
        }
      }
      if(bagianArray[results[i].bagian]){
        //bagian sudah ada sebelumnya
        //tambahkan pertanyaan
        if(!formField[results[i].id_form_field]){ //form field tersebut belum pernah ada sebelumnya
          bagianArray[results[i].bagian].response.push({
            pertanyaan: results[i].pertanyaan,
            urutan: results[i].urutan,
            tipe: results[i].tipe,
            option: option,
            value: [results[i].value]
          })
          formField[results[i].id_form_field]={bagian: results[i].bagian, idx: bagianArray[results[i].bagian].response.length-1};
        }
        else{ //user select multiple answers, add to the value
          let tempBagian = formField[results[i].id_form_field].bagian;
          let tempIdx = formField[results[i].id_form_field].idx;
          bagianArray[tempBagian].response[tempIdx].value.push(results[i].value);
        }
      }
      else{
        //bagian belum ada sebelumnya
        let sectionDescriptionsResult = await db.getSectionDescription(results[i].id_form,results[i].bagian);
        let temp = {
          judul: sectionDescriptionsResult[0].judul,
          bagian: results[i].bagian,
          deskripsi: null,
          response: [{
            pertanyaan: results[i].pertanyaan,
            urutan: results[i].urutan,
            tipe: results[i].tipe,
            option: option,
            value: [results[i].value]
          }]
        };
        if(sectionDescriptionsResult[0] && sectionDescriptionsResult[0].deskripsi){
          temp["deskripsi"] = sectionDescriptionsResult[0].deskripsi;
        }
        bagianArray.push(temp);
        formField[results[i].id_form_field]={bagian: results[i].bagian, idx: bagianArray[results[i].bagian].response.length-1};
      }
    }
    returnResult.responses = bagianArray;
    //console.log(bagianArray);
    //console.log(formField);
    return(returnResult);
  }
  catch(e){
    console.log(e);
    return null;
  }
}

router.get("/allFormResponses/:formID", async(req, res, next) => {
  /**Mendapatkan semua data response untuk semua response dengan form dengan id formID */
  try{
    let resultArray=[];
    let result = await db.getFormAllResultIds(req.params.formID);
    for(let i=0; i<result.length; i++){
      resultArray.push(result[i].id_form_result);
    }
    let listOfResponses=[];
    for(let i=0; i<resultArray.length; i++){
      let response = await getSpecificResponse(resultArray[i]);
      listOfResponses.push(response);
    }
    res.json(listOfResponses);
  }
  catch(e){
    console.log(e);
  }
})

router.get("/formResponse/:resultID", async(req, res, next) => {
  /*GET request untuk mendapatkan pertanyaan serta jawaban dari suatu respon dari suatu form*/
  try{
    let results = await db.getFormEachResponse(req.params.resultID);
    let formInfo = await db.getFormInfo(results[0].id_form);
    let returnResult={};
    returnResult.id_form= results[0].id_form;
    let dataPembuat = await db.getUserInfo(formInfo[0].id_pembuat);
    returnResult.pembuat = dataPembuat[0].username;
    returnResult.judulForm = formInfo[0].nama_form;
    returnResult.response_id=req.params.resultID;
    let bagianArray=[];
    let formField={};
    for (let i=0 ; i<results.length; i++){
      let option=[];
      if(results[i].tipe == "radio" || results[i].tipe == "checkbox"){
        let options = await db.getFormFieldOption(results[i].id_form_field);
        for(let i=0; i<options.length; i++){
          option.push({nilai: options[i].nilai});
        }
      }
      if(bagianArray[results[i].bagian]){
        //bagian sudah ada sebelumnya
        //tambahkan pertanyaan
        if(!formField[results[i].id_form_field]){ //form field tersebut belum pernah ada sebelumnya
          bagianArray[results[i].bagian].response.push({
            pertanyaan: results[i].pertanyaan,
            urutan: results[i].urutan,
            tipe: results[i].tipe,
            option: option,
            value: [results[i].value]
          })
          formField[results[i].id_form_field]={bagian: results[i].bagian, idx: bagianArray[results[i].bagian].response.length-1};
        }
        else{ //user select multiple answers, add to the value
          let tempBagian = formField[results[i].id_form_field].bagian;
          let tempIdx = formField[results[i].id_form_field].idx;
          bagianArray[tempBagian].response[tempIdx].value.push(results[i].value);
        }
      }
      else{
        //bagian belum ada sebelumnya
        let sectionDescriptionsResult = await db.getSectionDescription(results[i].id_form,results[i].bagian);
        let temp = {
          judul: `BAGIAN ${results[i].bagian+1}`,
          bagian: results[i].bagian,
          deskripsi: null,
          response: [{
            pertanyaan: results[i].pertanyaan,
            urutan: results[i].urutan,
            tipe: results[i].tipe,
            option: option,
            value: [results[i].value]
          }]
        };
        if(sectionDescriptionsResult[0] && sectionDescriptionsResult[0].deskripsi){
          temp["deskripsi"] = sectionDescriptionsResult[0].deskripsi;
        }
        bagianArray.push(temp);
        formField[results[i].id_form_field]={bagian: results[i].bagian, idx: bagianArray[results[i].bagian].response.length-1};
      }
    }
    returnResult.responses = bagianArray;
    //console.log(bagianArray);
    //console.log(formField);
    res.json(returnResult);
  }
  catch(e){
    console.log(e);
    res.sendStatus(500);
  }
})

router.get("/listOfForms/:titleSubstring", async(req, res, next) => {
  /*Get Request untuk mendapatkan list semua form yang ada */
  let user=[];
  let returnResult=[];
  try{
    let formsList = await db.getListOfMatchedForms(req.params.titleSubstring);
    for(let i=0; i<formsList.length; i++){
      let temp={};
      temp.id = formsList[i].id_form;
      temp.title = formsList[i].nama_form;
      if(!user[formsList[i].id_pembuat]){
        user[formsList[i].id_pembuat] = (await db.getUserInfo(formsList[i].id_pembuat))[0].username;
      } 
      temp.owner = user[formsList[i].id_pembuat];
      returnResult.push(temp);
    }
    res.send(returnResult);
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
      temp.id = formsList[i].id_form;
      temp.title = formsList[i].nama_form;
      if(!user[formsList[i].id_pembuat]){
        user[formsList[i].id_pembuat] = (await db.getUserInfo(formsList[i].id_pembuat))[0].username;
      } 
      temp.owner = user[formsList[i].id_pembuat];
      returnResult.push(temp);
    }
    res.send(returnResult);
  }
  catch(e){
    console.log(e);
    res.sendStatus(500);
  }
})

var dummy = ['John', 'Betty', 'Hal'];

router.get('/api/users', function (req, res) {
  res.json(dummy);
});


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

router.post("/deleteform", async(req,res,next) =>{
  try{
    let id_form = req.body.id_form;
    let results = await db.delete_form(id_form);
    res.json(results);
  }catch(e){
    console.log(e);
    res.sendStatus(500);
  }
});

router.post("/deleteresponse", async(req,res,next) =>{
  try{
    let id_form = req.body.id_form;
    let id_response = req.body.id_response;
    let results = await db.delete_response(id_form,id_response);
    res.json(results);
  }catch(e){
    console.log(e);
    res.sendStatus(500);
  }
});

uploader.post("/upload",(req,res) =>{
  if(req.files === null) {
    return res.status(400).json({ status: "failed", msg: 'No file uploaded'})
  }
  const file = req.files.file;  
  var filelocation = path.join(__dirname, '../db/images',file.name)
  file.mv(filelocation,err => {
    if(err) {
      console.error(err);
      return res.status(500).send(err);
    }

    res.json({status: "success",filename:`/images/${file.name}`})
  });
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


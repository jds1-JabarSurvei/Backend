const express = require("express");
const db = require("../db");
const bcrypt = require("bcrypt");
const nodemon = require("nodemon");
const { insert_form, update_form_section, all } = require("../db");
const saltRounds = 10;
const fileUpload = require('express-fileupload');
const path = require('path');
const { strict } = require("assert");
const router = express.Router();
const uploader = router.use(fileUpload());
router.use("/images", express.static(path.join(__dirname, '../db/images')))
const fs = require('fs');
const nconf = require('nconf');
const cors = require(cors());

var corsOptions = {
   origin: 'https://polar-tundra-59366.herokuapp.com',
   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
   allowedHeaders:["Control-Allow-Origin","Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type", "Accept, Access-Control-Allow-Origin"],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

router.post("/register",cors(corsOptions), async (req, res, next) => {
  /*POST request untuk meregister user baru sesuai parameter body*/
  let email = req.body.email;
  let username = req.body.email.split("@")[0];
  let password = req.body.password;
  let contactNumber = req.body.contactNumber;
  let gender = req.body.gender;
  let address = req.body.address;
  let birthday = req.body.birthday;
  res.download()
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

router.post("/login",cors(corsOptions), async (req, res, next) => {
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

async function getFormQuestionsForResponse(formID){
  try{
    let results = await db.getFormFields(formID);
    let firstResult = results[0];
    let returnResult={};
    returnResult.id_form= formID;
    let dataPembuat = await db.getUserInfo(firstResult.id_pembuat);
    returnResult.pembuat = dataPembuat[0].username;
    returnResult.judulForm = firstResult.nama_form;
    let time = firstResult.time;
    returnResult.image = await getImagesdesc(formID);
    returnResult.time = await getUnixtime(time);
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
        bagianArray[results[i].bagian].response.push({
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
        let sectionDescriptionsResult = await db.getSectionDescription(formID,results[i].bagian);
        // console.log(sectionDescriptionsResult);
        let temp = {
          judul: sectionDescriptionsResult[0].judul,
          bagian: results[i].bagian,
          deskripsi: null,
          response: [{
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
    returnResult.responses = bagianArray;
    return returnResult;
  }
  catch(e){
    console.log(e)
    return null
  }
}

async function getFormQuestions(formID){
  try{
    let results = await db.getFormFields(formID);
    let firstResult = results[0];
    let returnResult={};
    returnResult.id_form= formID;
    let dataPembuat = await db.getUserInfo(firstResult.id_pembuat);
    returnResult.pembuat = dataPembuat[0].username;
    returnResult.judulForm = firstResult.nama_form;
    let time = firstResult.time;
    returnResult.time = await getUnixtime(time);
    returnResult.image = await getImagesdesc(formID);
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
        let sectionDescriptionsResult = await db.getSectionDescription(formID,results[i].bagian);
        let temp = {
          judul: sectionDescriptionsResult[0].judul,
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
    return returnResult;
  }
  catch(e){
    console.log(e)
    return null
  }
}


router.get("/formQuestions/:formID",cors(corsOptions), async(req, res, next) => {
  /*GET REQUEST untuk mendapatkan list pertanyaan yang akan diisi oleh responden */
  try{
    let returnResult = await getFormQuestions(req.params.formID);

    res.json(returnResult);
  }
  catch(e){
    console.log(e);
  }
})

router.get("/formResponseIds/:formID",cors(corsOptions), async(req, res, next) => {
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

// async function getSpecificResponse(idResponse, formID){
//   /**Mendapatkan specific respons dengan idResponse tertentu */
//   try{
//     let results = await db.getFormEachResponse(idResponse);
//     let returnResult={};
//     let formInfo = await db.getFormInfo(formID);
//     returnResult.id_form= formID;
//     let dataPembuat = await db.getUserInfo(formInfo[0].id_pembuat);
//     returnResult.pembuat = dataPembuat[0].username;
//     returnResult.judulForm = formInfo[0].nama_form;
//     returnResult.response_id=idResponse;
//     let bagianArray=[];
//     let formField={};
//     for (let i=0 ; i<results.length; i++){
//       let option=[];
//       if(results[i].tipe == "radio" || results[i].tipe == "checkbox"){
//         let options = await db.getFormFieldOption(results[i].id_form_field);
//         for(let i=0; i<options.length; i++){
//           option.push({nilai: options[i].nilai});
//         }
//       }
//       if(bagianArray[results[i].bagian]){
//         //bagian sudah ada sebelumnya
//         //tambahkan pertanyaan
//         if(!formField[results[i].id_form_field]){ //form field tersebut belum pernah ada sebelumnya
//           bagianArray[results[i].bagian].response.push({
//             pertanyaan: results[i].pertanyaan,
//             urutan: results[i].urutan,
//             tipe: results[i].tipe,
//             option: option,
//             value: [{"response_id": idResponse ,"jawaban": [results[i].value]}]
//           })
//           formField[results[i].id_form_field]={bagian: results[i].bagian, idx: bagianArray[results[i].bagian].response.length-1};
//         }
//         else{ //user select multiple answers, add to the value
//           let tempBagian = formField[results[i].id_form_field].bagian;
//           let tempIdx = formField[results[i].id_form_field].idx;
//           bagianArray[tempBagian].response[tempIdx].value[0].jawaban.push(results[i].value);
//         }
//       }
//       else{
//         //bagian belum ada sebelumnya
//         let sectionDescriptionsResult = await db.getSectionDescription(results[i].id_form,results[i].bagian);
//         let temp = {
//           judul: sectionDescriptionsResult[0].judul,
//           bagian: results[i].bagian,
//           deskripsi: null,
//           response: [{
//             pertanyaan: results[i].pertanyaan,
//             urutan: results[i].urutan,
//             tipe: results[i].tipe,
//             option: option,
//             value: [{"response_id": idResponse ,"jawaban": [results[i].value]}]
//           }]
//         };
//         if(sectionDescriptionsResult[0] && sectionDescriptionsResult[0].deskripsi){
//           temp["deskripsi"] = sectionDescriptionsResult[0].deskripsi;
//         }
//         bagianArray.push(temp);
//         formField[results[i].id_form_field]={bagian: results[i].bagian, idx: bagianArray[results[i].bagian].response.length-1};
//       }
//     }
//     returnResult.responses = bagianArray;
//     return(returnResult);
//   }
//   catch(e){
//     console.log(e);
//     return null;
//   }
// }

// router.get("/allFormResponses/:formID", async(req, res, next) => {
//   /**Mendapatkan semua data response untuk semua response dengan form dengan id formID */
//   try{
//     let resultArray=[];
//     let result = await db.getFormAllResultIds(req.params.formID);
//     for(let i=0; i<result.length; i++){
//       resultArray.push(result[i].id_form_result);
//     }
//     let finalResponse = await getSpecificResponse(resultArray[0], req.params.formID);
//     delete finalResponse["response_id"];
//     for(let i=1; i<resultArray.length; i++){
//       let responseId = resultArray[i]
//       let response = await getSpecificResponse(responseId, req.params.formID);
//       //iterasi setiap bagian dari response
//       let responseAllBagian = response.responses;
//       // listOfResponses.push(response);
//       for(let j=0; j<responseAllBagian.length; j++){
//         let nomorBagian = responseAllBagian[j].bagian;
//         let responseAllPertanyaan = responseAllBagian[j].response;
//         for(let k=0; k<responseAllPertanyaan.length; k++){
//           let nomorPertanyaan = responseAllPertanyaan[k].urutan;
//           let jawabanPertanyaan = responseAllPertanyaan[k].value[0];
//           finalResponse.responses[nomorBagian].response[nomorPertanyaan].value.push(jawabanPertanyaan);
//         }
//       }
//     }

//     res.json(finalResponse);
//   }
//   catch(e){
//     console.log(e);
//   }
// })

async function getValueOfFormField (allResponseIDs, id_form_field) {
  let temp = await db.getFormFieldValue(id_form_field);
  let formattedValues = [];
  for(let i=0; i<temp.length; i++){
    let foundIndex = formattedValues.findIndex(formattedValue => formattedValue['response_id'] === temp[i]['response_id']);
    if (foundIndex == -1){
      //response Id sudah ada sebelumnya
      temp[i].jawaban = [temp[i].jawaban]
      formattedValues.push(temp[i])
    }
    else{
      formattedValues[foundIndex].jawaban.push(temp[i].jawaban)
    }
  }
  //Masukin semua response_ID yang null
  for(let i=0; i<allResponseIDs.length; i++){
    let foundIndex = formattedValues.findIndex(formattedValue => formattedValue['response_id'] === allResponseIDs[i]);
    if(foundIndex == -1){
      formattedValues.push({
        response_id: allResponseIDs[i],
        jawaban: null
      })
    }
  }
  return formattedValues;
}

router.get("/allFormResponses/:formID",cors(corsOptions), async(req, res, next) => {
  try{
    let allResponseIDs = await db.getAllFormResponseID(req.params.formID);
    let returnResult = await getFormQuestionsForResponse(req.params.formID);
    let allResponses = returnResult.responses;
    for(let bagIdx=0; bagIdx<allResponses.length; bagIdx++){
      let allPertanyaan=allResponses[bagIdx].response;
      for(let qIdx=0; qIdx<allPertanyaan.length; qIdx++){
        allPertanyaan[qIdx].value = await getValueOfFormField(allResponseIDs, allPertanyaan[qIdx].id_form_field);
      }
    }
    res.json(returnResult);
  }
  catch(e){
    console.log(e);
    res.sendStatus(500);
    res.json({message:"tidak ditemukan form"});
  }
})

router.get("/formResponse/:resultID",cors(corsOptions), async(req, res, next) => {
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
        console.log(sectionDescriptionsResult);
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

router.get("/listOfForms/:titleSubstring",cors(corsOptions), async(req, res, next) => {
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
      temp.image = await getImagesdesc(formsList[i].id_form);
      let time = formsList[i].time;
      temp.time = await getUnixtime(time);
      returnResult.push(temp);
    }
    res.send(returnResult);
  }
  catch(e){
    console.log(e);
    res.sendStatus(500);
  }
})

router.get("/listOfForms",cors(corsOptions), async(req, res, next) => {
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
      temp.image = await getImagesdesc(formsList[i].id_form);
      let time = formsList[i].time;
      temp.time = await getUnixtime(time);
      returnResult.push(temp);
    }
    res.send(returnResult);
  }
  catch(e){
    console.log(e);
    res.json({message:"tidak ditemukan"});
  }
})

var dummy = ['John', 'Betty', 'Hal'];

router.get('/api/users', function (req, res) {
  res.json(dummy);
});


router.post("/buatform",cors(corsOptions), async (req, res, next) => {
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

router.post("/submitjawaban",cors(corsOptions), async (req, res, next) => {
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

router.post("/deleteform",cors(corsOptions), async(req,res,next) =>{
  try{
    let id_form = req.body.id_form;
    let results = await db.delete_form(id_form);
    res.json(results);
  }catch(e){
    console.log(e);
    res.sendStatus(500);
  }
});

// router.post("/deleteresponse", async(req,res,next) =>{
//   try{
//     let id_form = req.body.id_form;
//     let id_response = req.body.id_response;
//     let results = await db.delete_response(id_form,id_response);
//     res.json(results);
//   }catch(e){
//     console.log(e);
//     res.sendStatus(500);
//   }
// });

router.post("/editform",cors(corsOptions), async(req, res, next) => {
  try{
    let id_form = req.body.id_form;
    let judulForm = req.body.judulForm;
    let bagianArray = req.body.bagian;
    //Update form info
    await db.update_form_info(id_form, judulForm);
    for(let i=0; i<bagianArray.length; i++){
      let bagian=bagianArray[i];
      //Update section
      let result = await db.update_form_section(id_form, i, bagian.judul, bagian.deskripsi);
      // Update pertanyaan
      let pertanyaanArray = bagian.pertanyaan;
      // console.log("Panjang array pertanyaan: " + pertanyaanArray.length);
      for(let j=0; j<pertanyaanArray.length; j++){
        let id_form_field_temp = await db.getFormFieldId(id_form, i, j);
        let id_form_field = null;
        if(id_form_field_temp && id_form_field_temp[0] && id_form_field_temp[0].id_form_field){
          id_form_field = id_form_field_temp[0].id_form_field;
        }

        if(id_form_field){
          //form field sudah ada sebelumnya
          //update form_field
          await db.update_form_field(id_form_field, pertanyaanArray[j].pertanyaan, pertanyaanArray[j].tipe, pertanyaanArray[j].deskripsi, pertanyaanArray[j].required);
          //tambahkan option baru
          let newOptions = pertanyaanArray[j].option;
          for(let k=0; k<newOptions.length; k++){
            let form_field_option_id = await db.get_form_field_option_id(id_form_field, k);
            form_field_option_id = form_field_option_id && form_field_option_id[0] && form_field_option_id[0].id_form_field_option;
            if(form_field_option_id){
              //sudah ada sebelumnya
              await db.update_form_field_option(form_field_option_id, newOptions[k], k);
            }
            else{
              await db.insert_pertanyaan_pilihan(id_form_field, newOptions[k], k);
            }
          }

          //soft delete option yang udah gak ada -> yaitu mulai len(newOptions) sampe highest urutan option dari form field tersebut
          let old_highest_urutan_option = await db.get_highest_urutan_option(id_form_field);
          old_highest_urutan_option = old_highest_urutan_option && old_highest_urutan_option[0] && old_highest_urutan_option[0].urutan;
          for(let oldIdx=newOptions.length; oldIdx<=old_highest_urutan_option; oldIdx++){
            db.soft_delete_option(id_form_field, oldIdx);
          }
        }
        else{
          //form field belum ada sebelumnya
          //masukan form field
          await db.insert_pertanyaan(id_form, i, j, pertanyaanArray[j].pertanyaan, pertanyaanArray[j].tipe, pertanyaanArray[j].deskripsi, pertanyaanArray[j].required);
          //cari id_form_field
          let id_form_field_temp = await db.getFormFieldId(id_form, i, j);
          let id_form_field = id_form_field_temp && id_form_field_temp[0] && id_form_field_temp[0].id_form_field;
          //tambahkan option baru
          let newOptions = pertanyaanArray[j].option;
          for(let k=0; k<newOptions.length; k++){
            await db.insert_pertanyaan_pilihan(id_form_field, newOptions[k], k);
          }
        }
      }
      //softdelete pertanyaan yang udah gak ada
      let old_highest_urutan_field = await db.get_highest_urutan_pertanyaan(id_form, i);
      old_highest_urutan_field = old_highest_urutan_field && old_highest_urutan_field[0] && old_highest_urutan_field[0].urutan;
      for(let oldIdx=pertanyaanArray.length; oldIdx<=old_highest_urutan_field; oldIdx++){
        db.soft_delete_pertanyaan(id_form, i, oldIdx);
      }
    }
    //bagian yang udah gak ada lagi
    let old_highest_bagian = await db.get_highest_form_bagian(id_form);
    old_highest_bagian = old_highest_bagian[0].id_bagian;
    for(let oldIdx=bagianArray.length; oldIdx<=old_highest_bagian; oldIdx++){
      console.log("Bagian yang mau diilangin");
      console.log(oldIdx);
      console.log("Bagian yang mau diilangin");
      //softdelete bagian
      await db.soft_delete_bagian(id_form, oldIdx);
      console.log("Bagian " + oldIdx + " berhasil disoft delete");
      // //softdelete pertanyaan" dari bagian itu
      let old_highest_urutan_field = await db.get_highest_urutan_pertanyaan(id_form, oldIdx);
      
      if(old_highest_urutan_field && old_highest_urutan_field[0]){
        console.log("Masukk sinii gak yyaaa??");
        for(let qIdx=0; qIdx<=old_highest_urutan_field[0].urutan; qIdx++){
          db.soft_delete_pertanyaan(id_form, oldIdx, qIdx);
        }
      }

    }

    res.json("Selesai");
  }

  catch(e){
    console.log(e);
    res.sendStatus(500);
  }

})
uploader.post("/upload",cors(corsOptions),async(req,res)  =>{ 
  if(req.files === null) {
    return res.status(400).json({ status: "failed", msg: 'No file uploaded'})
  }
  
  const file = req.files.file;
  const filename = req.body.name;
  // var typefile = filename.split('.').pop();
  const id_form = req.body.id_form;
  var hashedfilename = await bcrypt.hash(filename, 11);
  hashedfilename = (hashedfilename.replace(/[\W_]+/g,""));
  var filelocation = "";
  var i = 0;
  while (1){
    filelocation = path.join(__dirname, '../db/images',`${hashedfilename}.jpg`);
    
    if (!fs.existsSync(filelocation)){
      break;  
    }
    i++;
    hashedfilename = hashedfilename + String(i);
  }
  await db.insert_form_image(filename, `/images/${hashedfilename}.jpg`, id_form);
  file.mv(filelocation,err => {
    if(err) {
      console.error(err);
      res.status(500).send(err);
    }

    res.json({status: "success",filename:`${filename}`, url:`/images/${hashedfilename}.jpg`});
  });
});

async function getUnixtime(time){
  return Math.floor(new Date(time).getTime()/1000);
}

async function getImagesdesc(id_form){
  let imageres = await db.getPathImages(id_form);
  if ((typeof imageres[0] === 'undefined')){
    return {name:null,filename:null};
  }
  return {name:imageres[0].filename, path:imageres[0].path};
}

router.post("/inputcarousel",cors(corsOptions), async(req,res,next) =>{
  try{
    let carousel = req.body.carousel;
    let conflocation = path.join(__dirname, '../db/asset.json')
    nconf.use('file', { file: conflocation });
    nconf.load();
    nconf.set('carousel', carousel);
    
    let saved = nconf.get('carousel');
    
    nconf.save();
    res.json({status:"success",carousel:saved})
  }catch(e){
    console.log(e);
    res.sendStatus(500);
  }
});

router.get("/configuration",cors(corsOptions), async (req, res, next) => {
  try {
    let conflocation = path.join(__dirname, '../db/asset.json');
    nconf.use('file', { file: conflocation });
    nconf.load();
    let carouselconf = nconf.get('carousel');
    res.json({carousel:carouselconf});
  } catch (e) {
      console.log(e);
      res.sendStatus(500);
  }
});

router.get("/listOfCarousel",cors(corsOptions), async (req, res, next) => {
  let user=[];
  let returnResult=[];
  try {
    let conflocation = path.join(__dirname, '../db/asset.json');
    nconf.use('file', { file: conflocation });
    nconf.load();
    let carousel = nconf.get('carousel');
    let formsList = await db.getFormInSetInfo(carousel);
    carousel = carousel.split(",");
    for (let i=0; i<carousel.length; i++){
        const mess = {message:"id_form tidak ditemukan"};
        returnResult.splice(i, 0, mess)  
    }
    for(let i=0; i<formsList.length; i++){
      let temp={};
      temp.id = formsList[i].id_form;
      temp.title = formsList[i].nama_form;
      if(!user[formsList[i].id_pembuat]){
        user[formsList[i].id_pembuat] = (await db.getUserInfo(formsList[i].id_pembuat))[0].username;
      } 
      temp.owner = user[formsList[i].id_pembuat];
      temp.image = await getImagesdesc(formsList[i].id_form);
      let time = formsList[i].time;
      temp.time = await getUnixtime(time);
      var index = carousel.indexOf(String(temp.id));
      returnResult[index] = temp;     }
      // console.log(index);
      // returnResult.push(temp);
    
    res.send(returnResult);
  } catch (e) {
    console.log(e);
    res.json({message:"tidak ditemukan"});
  }
});


router.get("/all",cors(corsOptions), async (req, res, next) => {
  try {
    let results = await db.all();
    res.json(results);
  } catch (e) {
      console.log(e);
      res.sendStatus(500);
  }
});

module.exports = router;


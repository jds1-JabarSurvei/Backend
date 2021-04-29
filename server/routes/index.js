const express = require("express");
const db = require("../db");
const bcrypt = require("bcrypt");
const fileUpload = require('express-fileupload');
const path = require('path');
const router = express.Router();
const uploader = router.use(fileUpload());
const fs = require('fs');

const user = require('../controllers/user.controller');
const form = require('../controllers/form.controller');
const carousel = require('../controllers/carousel.controller');

router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://staging-fe-jds01.herokuapp.com");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
/* 
User Routes
*/
// GET Request
router.get('/all', user.findAll);

// POST Request
router.post('/register', user.register);
router.post('/login', user.login);


/* 
Form Routes 
*/
// GET Request
router.get("/listOfForms", form.findAllForms);
router.get("/listOfForms/:titleSubstring", form.findFormsBySubstring);
router.get("/formQuestions/:formID", form.getFormQuestions);
router.get("/formResponseIds/:formID", form.getFormResponsesIDs);
router.get("/allFormResponses/:formID", form.getFormResponses);
router.get("/formResponse/:resultID", form.getResponseDetail);

// POST Request
router.post("/buatform", form.createForm);
router.post("/submitjawaban", form.submitAnswer);
router.post("/deleteform", form.deleteForm);
router.post("/editform", form.editForm);

/*
Carousel Routes
*/
// GET Request
router.get("/configuration", carousel.getConfiguration);
router.get("/listOfCarousel", carousel.getAllCarousel);

// POST Request
router.post("/inputcarousel", carousel.inputCarousel);

/*
Uploader Routes
*/
router.use("/images", express.static(path.join(__dirname, '../db/images')))

uploader.post("/upload", async (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ status: "failed", msg: 'No file uploaded' })
  }

  const file = req.files.file;
  const filename = req.body.name;
  // var typefile = filename.split('.').pop();
  const id_form = req.body.id_form;
  var hashedfilename = await bcrypt.hash(filename, 11);
  hashedfilename = (hashedfilename.replace(/[\W_]+/g, ""));
  var filelocation = "";
  var i = 0;
  while (1) {
    filelocation = path.join(__dirname, '../db/images', `${hashedfilename}.jpg`);

    if (!fs.existsSync(filelocation)) {
      break;
    }
    i++;
    hashedfilename = hashedfilename + String(i);
  }
  await db.insert_form_image(filename, `/images/${hashedfilename}.jpg`, id_form);
  file.mv(filelocation, err => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    }

    res.json({ status: "success", filename: `${filename}`, url: `/images/${hashedfilename}.jpg` });
  });
});

async function getUnixtime(time) {
  return Math.floor(new Date(time).getTime() / 1000);
}

async function getImagesdesc(id_form) {
  let imageres = await db.getPathImages(id_form);
  if ((typeof imageres[0] === 'undefined')) {
    return { name: null, filename: null };
  }
  return { name: imageres[0].filename, path: imageres[0].path };
}

module.exports = router;

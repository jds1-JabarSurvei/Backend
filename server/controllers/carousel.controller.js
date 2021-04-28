const db = require("../db");
const path = require('path');
const nconf = require('nconf');

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

exports.getConfiguration = async (req, res) => {
    try {
        let conflocation = path.join(__dirname, '../db/asset.json');
        nconf.use('file', { file: conflocation });
        nconf.load();
        let carouselconf = nconf.get('carousel');
        res.json({ carousel: carouselconf });
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
}

exports.getAllCarousel = async (req, res) => {
    let user = [];
    let returnResult = [];
    try {
        let conflocation = path.join(__dirname, '../db/asset.json');
        nconf.use('file', { file: conflocation });
        nconf.load();
        let carousel = nconf.get('carousel');
        let formsList = await db.getFormInSetInfo(carousel);
        carousel = carousel.split(",");
        for (let i = 0; i < carousel.length; i++) {
            const mess = { message: "id_form tidak ditemukan" };
            returnResult.splice(i, 0, mess)
        }
        for (let i = 0; i < formsList.length; i++) {
            let temp = {};
            temp.id = formsList[i].id_form;
            temp.title = formsList[i].nama_form;
            if (!user[formsList[i].id_pembuat]) {
                user[formsList[i].id_pembuat] = (await db.getUserInfo(formsList[i].id_pembuat))[0].username;
            }
            temp.owner = user[formsList[i].id_pembuat];
            temp.image = await getImagesdesc(formsList[i].id_form);
            let time = formsList[i].time;
            temp.time = await getUnixtime(time);
            var index = carousel.indexOf(String(temp.id));
            returnResult[index] = temp;
        }
        // console.log(index);
        // returnResult.push(temp);

        res.send(returnResult);
    } catch (e) {
        console.log(e);
        res.json({ message: "tidak ditemukan" });
    }
}

exports.inputCarousel = async (req, res, next) => {
    try {
        let carousel = req.body.carousel;
        let conflocation = path.join(__dirname, '../db/asset.json')
        nconf.use('file', { file: conflocation });
        nconf.load();
        nconf.set('carousel', carousel);

        let saved = nconf.get('carousel');

        nconf.save();
        res.json({ status: "success", carousel: saved })
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
}
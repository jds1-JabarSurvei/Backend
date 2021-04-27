const db = require("../db");

async function getFormQuestionsForResponse(formID) {
    try {
        let results = await db.getFormFields(formID);
        let firstResult = results[0];
        let returnResult = {};
        returnResult.id_form = formID;
        let dataPembuat = await db.getUserInfo(firstResult.id_pembuat);
        returnResult.pembuat = dataPembuat[0].username;
        returnResult.judulForm = firstResult.nama_form;
        let time = firstResult.time;
        returnResult.image = await getImagesdesc(formID);
        returnResult.time = await getUnixtime(time);
        let bagianArray = []
        for (let i = 0; i < results.length; i++) {
            let option = [];
            if (results[i].tipe == "radio" || results[i].tipe == "checkbox") {
                let options = await db.getFormFieldOption(results[i].id_form_field);
                for (let i = 0; i < options.length; i++) {
                    option.push({ nilai: options[i].nilai, id_form_option: options[i].id_form_field_option });
                }
            }
            if (bagianArray[results[i].bagian]) {
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
            else {
                //bagian belum ada sebelumnya
                let sectionDescriptionsResult = await db.getSectionDescription(formID, results[i].bagian);
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
                if (sectionDescriptionsResult[0] && sectionDescriptionsResult[0].deskripsi) {
                    temp["deskripsi"] = sectionDescriptionsResult[0].deskripsi;
                }
                bagianArray.push(temp);
            }
        }
        returnResult.responses = bagianArray;
        return returnResult;
    }
    catch (e) {
        console.log(e)
        return null
    }
}

async function getFormQuestions(formID) {
    try {
        let results = await db.getFormFields(formID);
        let firstResult = results[0];
        let returnResult = {};
        returnResult.id_form = formID;
        let dataPembuat = await db.getUserInfo(firstResult.id_pembuat);
        returnResult.pembuat = dataPembuat[0].username;
        returnResult.judulForm = firstResult.nama_form;
        let time = firstResult.time;
        returnResult.time = await getUnixtime(time);
        returnResult.image = await getImagesdesc(formID);
        let bagianArray = []
        for (let i = 0; i < results.length; i++) {
            let option = [];
            if (results[i].tipe == "radio" || results[i].tipe == "checkbox") {
                let options = await db.getFormFieldOption(results[i].id_form_field);
                for (let i = 0; i < options.length; i++) {
                    option.push({ nilai: options[i].nilai, id_form_option: options[i].id_form_field_option });
                }
            }
            if (bagianArray[results[i].bagian]) {
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
            else {
                //bagian belum ada sebelumnya
                let sectionDescriptionsResult = await db.getSectionDescription(formID, results[i].bagian);
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
                if (sectionDescriptionsResult[0] && sectionDescriptionsResult[0].deskripsi) {
                    temp["deskripsi"] = sectionDescriptionsResult[0].deskripsi;
                }
                bagianArray.push(temp);
            }
        }
        returnResult.pertanyaan = bagianArray;
        return returnResult;
    }
    catch (e) {
        console.log(e)
        return null
    }
}

async function getValueOfFormField(allResponseIDs, id_form_field) {
    let temp = await db.getFormFieldValue(id_form_field);
    let formattedValues = [];
    for (let i = 0; i < temp.length; i++) {
        let foundIndex = formattedValues.findIndex(formattedValue => formattedValue['response_id'] === temp[i]['response_id']);
        if (foundIndex == -1) {
            //response Id sudah ada sebelumnya
            temp[i].jawaban = [temp[i].jawaban]
            formattedValues.push(temp[i])
        }
        else {
            formattedValues[foundIndex].jawaban.push(temp[i].jawaban)
        }
    }
    //Masukin semua response_ID yang null
    for (let i = 0; i < allResponseIDs.length; i++) {
        let foundIndex = formattedValues.findIndex(formattedValue => formattedValue['response_id'] === allResponseIDs[i]);
        if (foundIndex == -1) {
            formattedValues.push({
                response_id: allResponseIDs[i],
                jawaban: null
            })
        }
    }
    return formattedValues;
}

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

// Get All Forms
exports.findAllForms = async (req, res) => {
    /*Get Request untuk mendapatkan list semua form yang ada */
    let user = [];
    let returnResult = [];
    try {
        let formsList = await db.getListOfForms();
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
            returnResult.push(temp);
        }
        res.send(returnResult);
    }
    catch (e) {
        console.log(e);
        res.json({ message: "tidak ditemukan" });
    }
}

exports.findFormsBySubstring = async (req, res) => {
    /*Get Request untuk mendapatkan list semua form yang ada */
    let user = [];
    let returnResult = [];
    try {
        let formsList = await db.getListOfMatchedForms(req.params.titleSubstring);
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
            returnResult.push(temp);
        }
        res.send(returnResult);
    }
    catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
}

exports.getFormQuestions = async (req, res) => {
    /*GET REQUEST untuk mendapatkan list pertanyaan yang akan diisi oleh responden */
    try {
        let returnResult = await getFormQuestions(req.params.formID);

        res.json(returnResult);
    }
    catch (e) {
        console.log(e);
    }
}

exports.getFormResponses = async (req, res) => {
    try {
        let allResponseIDs = await db.getAllFormResponseID(req.params.formID);
        let returnResult = await getFormQuestionsForResponse(req.params.formID);
        let allResponses = returnResult.responses;
        for (let bagIdx = 0; bagIdx < allResponses.length; bagIdx++) {
            let allPertanyaan = allResponses[bagIdx].response;
            for (let qIdx = 0; qIdx < allPertanyaan.length; qIdx++) {
                allPertanyaan[qIdx].value = await getValueOfFormField(allResponseIDs, allPertanyaan[qIdx].id_form_field);
            }
        }
        res.json(returnResult);
    }
    catch (e) {
        console.log(e);
        res.sendStatus(500);
        res.json({ message: "tidak ditemukan form" });
    }
}

exports.getFormResponsesIDs = async (req, res) => {
    /**Mendapatkan semua response id untuk form dengan id formID*/
    try {
        let resultArray = [];
        let result = await db.getFormAllResultIds(req.params.formID);
        for (let i = 0; i < result.length; i++) {
            resultArray.push(result[i].id_form_result);
        }
        res.json(resultArray);
    }
    catch (e) {
        console.log(e);
    }
}

exports.getResponseDetail = async (req, res, next) => {
    /*GET request untuk mendapatkan pertanyaan serta jawaban dari suatu respon dari suatu form*/
    try {
        let results = await db.getFormEachResponse(req.params.resultID);
        let formInfo = await db.getFormInfo(results[0].id_form);
        let returnResult = {};
        returnResult.id_form = results[0].id_form;
        let dataPembuat = await db.getUserInfo(formInfo[0].id_pembuat);
        returnResult.pembuat = dataPembuat[0].username;
        returnResult.judulForm = formInfo[0].nama_form;
        returnResult.response_id = req.params.resultID;
        let bagianArray = [];
        let formField = {};
        for (let i = 0; i < results.length; i++) {
            let option = [];
            if (results[i].tipe == "radio" || results[i].tipe == "checkbox") {
                let options = await db.getFormFieldOption(results[i].id_form_field);
                for (let i = 0; i < options.length; i++) {
                    option.push({ nilai: options[i].nilai });
                }
            }
            if (bagianArray[results[i].bagian]) {
                //bagian sudah ada sebelumnya
                //tambahkan pertanyaan
                if (!formField[results[i].id_form_field]) { //form field tersebut belum pernah ada sebelumnya
                    bagianArray[results[i].bagian].response.push({
                        pertanyaan: results[i].pertanyaan,
                        urutan: results[i].urutan,
                        tipe: results[i].tipe,
                        option: option,
                        value: [results[i].value]
                    })
                    formField[results[i].id_form_field] = { bagian: results[i].bagian, idx: bagianArray[results[i].bagian].response.length - 1 };
                }
                else { //user select multiple answers, add to the value
                    let tempBagian = formField[results[i].id_form_field].bagian;
                    let tempIdx = formField[results[i].id_form_field].idx;
                    bagianArray[tempBagian].response[tempIdx].value.push(results[i].value);
                }
            }
            else {
                //bagian belum ada sebelumnya
                let sectionDescriptionsResult = await db.getSectionDescription(results[i].id_form, results[i].bagian);
                console.log(sectionDescriptionsResult);
                let temp = {
                    judul: `BAGIAN ${results[i].bagian + 1}`,
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
                if (sectionDescriptionsResult[0] && sectionDescriptionsResult[0].deskripsi) {
                    temp["deskripsi"] = sectionDescriptionsResult[0].deskripsi;
                }
                bagianArray.push(temp);
                formField[results[i].id_form_field] = { bagian: results[i].bagian, idx: bagianArray[results[i].bagian].response.length - 1 };
            }
        }
        returnResult.responses = bagianArray;
        //console.log(bagianArray);
        //console.log(formField);
        res.json(returnResult);
    }
    catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
}

// Create a new Form
exports.createForm = async (req, res) => {
    let id_pembuat = req.body.user_id;
    let nama_form = req.body.judulForm;
    let bagianArray = req.body.bagian;
    try {
        let id_form = await db.insert_form(id_pembuat, nama_form);
        id_form = id_form['insertId'];
        let section = 0;
        for (var numbagian in bagianArray) {
            let bagian = bagianArray[numbagian];
            let pertanyaan_order = 0;
            await db.insert_form_section(id_form, section, bagian["judul"], bagian["deskripsi"]);
            if (bagian["pertanyaan"]) {
                for (var numpertanyaan in bagian["pertanyaan"]) {
                    let pertanyaan = bagian["pertanyaan"][numpertanyaan];
                    let id_form_field = await db.insert_pertanyaan(
                        id_form,
                        section,
                        pertanyaan_order,
                        pertanyaan["pertanyaan"],
                        pertanyaan["tipe"],
                        pertanyaan["deskripsi"],
                        pertanyaan["required"]);
                    if (pertanyaan["option"]) {
                        let option_order = 0;
                        for (var numoption in pertanyaan["option"]) {
                            let option = pertanyaan["option"][numoption];
                            await db.insert_pertanyaan_pilihan(
                                id_form_field["insertId"], option["nilai"], option_order);
                            option_order++;
                        }
                    }
                    pertanyaan_order++;
                }
            }
            section++;
        }
        res.json({ "status": "success", "id_form": id_form });
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
}

// Submit form answer
exports.submitAnswer = async (req, res) => {
    try {
        let id_form = req.body.id_form;
        let jawaban = req.body.jawaban;
        let id_res = await db.insert_hasil_form(id_form);
        id_res = id_res["insertId"]
        for (var numjawaban in jawaban) {
            let ans = jawaban[numjawaban];
            await db.insert_jawaban_pertanyaan(id_res, ans["id_form_field"], ans["id_form_option"], ans["value"]);
        }
        res.json({ "id_res": id_res, "status": "success" });
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
}

// Delete a form By ID
exports.deleteForm = async (req, res) => {
    try {
        let id_form = req.body.id_form;
        let results = await db.delete_form(id_form);
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
}

// Edit form
exports.editForm = async (req, res) => {
    try {
        let id_form = req.body.id_form;
        let judulForm = req.body.judulForm;
        let bagianArray = req.body.bagian;
        let deletedArray = req.body.deletedField;
        let deletedBagianArray = req.body.deletedSection;
        //Update form info
        await db.update_form_info(id_form, judulForm);

        //soft delete bagian beserta pertanyaan" bagian itu
        for (let oldIdx = 0; oldIdx <= deletedBagianArray.length; oldIdx++) {
            //softdelete bagian
            await db.soft_delete_bagian(id_form, deletedBagianArray[oldIdx]);
            // //softdelete pertanyaan" dari bagian itu
            let old_highest_urutan_field = await db.get_highest_urutan_pertanyaan(id_form, deletedBagianArray[oldIdx]);

            if (old_highest_urutan_field && old_highest_urutan_field[0]) {
                for (let qIdx = 0; qIdx <= old_highest_urutan_field[0].urutan; qIdx++) {
                    // db.soft_delete_pertanyaan(id_form, oldIdx, qIdx);
                    let id_form_field_temp = await db.getFormFieldId(id_form, deletedBagianArray[oldIdx], qIdx);
                    let id_form_field = null;
                    if (id_form_field_temp && id_form_field_temp[0] && id_form_field_temp[0].id_form_field) {
                        id_form_field = id_form_field_temp[0].id_form_field;
                    }
                    if (id_form_field) {
                        await db.soft_delete_pertanyaan_on_IDFormField(id_form_field);
                    }
                }
            }

        }

        for (let i = 0; i < bagianArray.length; i++) {
            let bagian = bagianArray[i];
            //Update section
            let result = await db.update_form_section(id_form, i, bagian.judul, bagian.deskripsi);
            // Update pertanyaan
            let pertanyaanArray = bagian.pertanyaan;
            // console.log("Panjang array pertanyaan: " + pertanyaanArray.length);


            //soft delete pertanyaan di list deletedField
            for (let idx = 0; idx < deletedArray.length; idx++) {
                // console.log("Form field id yang dihapus");
                // console.log(deletedArray[idx]);
                // console.log("Form field id yang dihapus");
                await db.soft_delete_pertanyaan_on_IDFormField(deletedArray[idx]);
            }

            for (let j = 0; j < pertanyaanArray.length; j++) {
                let id_form_field_temp = await db.getFormFieldId(id_form, i, j);
                // console.log("Form field id yang ditemukan");
                // console.log(id_form_field_temp);
                // console.log("Form field id yang ditemukan");
                let id_form_field = null;
                if (id_form_field_temp && id_form_field_temp[0] && id_form_field_temp[0].id_form_field) {
                    id_form_field = id_form_field_temp[0].id_form_field;
                }

                if (id_form_field) {
                    //form field sudah ada sebelumnya
                    //update form_field
                    await db.update_form_field(id_form_field, pertanyaanArray[j].pertanyaan, pertanyaanArray[j].tipe, pertanyaanArray[j].deskripsi, pertanyaanArray[j].required);
                    //tambahkan option baru
                    let newOptions = pertanyaanArray[j].option;
                    for (let k = 0; k < newOptions.length; k++) {
                        let form_field_option_id = await db.get_form_field_option_id(id_form_field, k);
                        form_field_option_id = form_field_option_id && form_field_option_id[0] && form_field_option_id[0].id_form_field_option;
                        if (form_field_option_id) {
                            //sudah ada sebelumnya
                            await db.update_form_field_option(form_field_option_id, newOptions[k], k);
                        }
                        else {
                            await db.insert_pertanyaan_pilihan(id_form_field, newOptions[k], k);
                        }
                    }

                    //soft delete option yang udah gak ada -> yaitu mulai len(newOptions) sampe highest urutan option dari form field tersebut
                    let old_highest_urutan_option = await db.get_highest_urutan_option(id_form_field);
                    old_highest_urutan_option = old_highest_urutan_option && old_highest_urutan_option[0] && old_highest_urutan_option[0].urutan;
                    for (let oldIdx = newOptions.length; oldIdx <= old_highest_urutan_option; oldIdx++) {
                        db.soft_delete_option(id_form_field, oldIdx);
                    }
                }
                else {
                    //form field belum ada sebelumnya
                    //masukan form field
                    await db.insert_pertanyaan(id_form, i, j, pertanyaanArray[j].pertanyaan, pertanyaanArray[j].tipe, pertanyaanArray[j].deskripsi, pertanyaanArray[j].required);
                    //cari id_form_field
                    let id_form_field_temp = await db.getFormFieldId(id_form, i, j);
                    let id_form_field = id_form_field_temp && id_form_field_temp[0] && id_form_field_temp[0].id_form_field;
                    //tambahkan option baru
                    let newOptions = pertanyaanArray[j].option;
                    for (let k = 0; k < newOptions.length; k++) {
                        await db.insert_pertanyaan_pilihan(id_form_field, newOptions[k], k);
                    }
                }
            }
            //softdelete pertanyaan yang udah gak ada
            // let old_highest_urutan_field = await db.get_highest_urutan_pertanyaan(id_form, i);
            // old_highest_urutan_field = old_highest_urutan_field && old_highest_urutan_field[0] && old_highest_urutan_field[0].urutan;
            // for(let oldIdx=pertanyaanArray.length; oldIdx<=old_highest_urutan_field; oldIdx++){
            //   db.soft_delete_pertanyaan(id_form, i, oldIdx);
            // }
        }
        //bagian yang udah gak ada lagi
        // let old_highest_bagian = await db.get_highest_form_bagian(id_form);
        // old_highest_bagian = old_highest_bagian[0].id_bagian;
        // for(let oldIdx=bagianArray.length; oldIdx<=old_highest_bagian; oldIdx++){
        //   //softdelete bagian
        //   await db.soft_delete_bagian(id_form, oldIdx);
        //   // //softdelete pertanyaan" dari bagian itu
        //   let old_highest_urutan_field = await db.get_highest_urutan_pertanyaan(id_form, oldIdx);

        //   if(old_highest_urutan_field && old_highest_urutan_field[0]){
        //     for(let qIdx=0; qIdx<=old_highest_urutan_field[0].urutan; qIdx++){
        //       db.soft_delete_pertanyaan(id_form, oldIdx, qIdx);
        //     }
        //   }

        // }

        res.json("Selesai");
    }

    catch (e) {
        console.log(e);
        res.sendStatus(500);
    }


}
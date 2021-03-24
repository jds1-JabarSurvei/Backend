'use strict';

var test = require('tape');
var request = require('supertest');
var app = require('../server');

// test('Test correct list of forms returned', function(t){
//     request(app)
//     .get('/listOfForms')
//     .expect('Content-Type', /json/)
//     .expect(200)
//     .end(function(err, res){
//         var expectedUsers = [
//             {
//                 "id": 1,
//                 "title": "dummy",
//                 "owner": "user"
//             },
//             {
//                 "id": 2,
//                 "title": "dummy2",
//                 "owner": "user"
//             },
//             {
//                 "id": 3,
//                 "title": "dummy",
//                 "owner": "user"
//             },
//             {
//                 "id": 4,
//                 "title": "NEW dummy",
//                 "owner": "user"
//             },
//             {
//                 "id": 5,
//                 "title": "YUHUHUHU dummy",
//                 "owner": "user"
//             },
//             {
//                 "id": 6,
//                 "title": "Untitled Form",
//                 "owner": "user"
//             },
//             {
//                 "id": 7,
//                 "title": "Tes Submit API Form",
//                 "owner": "user"
//             },
//             {
//                 "id": 8,
//                 "title": "Tes Submit API Form 2",
//                 "owner": "user"
//             }
//         ];

//         t.error(err, 'No error');
//         t.same(res.body, expectedUsers, 'List of forms as expected');
//         t.end();
//     });
// });

// edit zaidan 
test('Test buat from', function(t){
    request(app)
    .post('/buatform')
    .send({
        "user_id":"1",
        "judulForm": "dummy",
        "bagian": [
            {
                "judul": "BAGIAN 1",
                "deskripsi": "dummy",
                "pertanyaan": [
                    {
                        "pertanyaan": "(dummy)Kenapa Spongebob warnanya kuning?",
                        "deskripsi": "kemukakan jawaban anda mengenai warna kuning dari spongebob",
                        "required": "1",
                        "urutan": 1,
                        "tipe": "short_answer",
                        "option": []
                    },
                    {
                        "pertanyaan": "Pertanyaan 2 bagian 0 form 1?",
                        "deskripsi": "deskripsi pertanyaan 2 form 1",
                        "required": "1",
                        "urutan": 2,
                        "tipe": "short_answer",
                        "option": []
                    }
                ]
            },
            {
                "judul": "BAGIAN 2",
                "deskripsi": null,
                "pertanyaan": [
                    {
                        "pertanyaan": "Pertanyaan 1  bagian 1 form 1?",
                        "deskripsi": "deskripsi pertanyaan 0 bagian 1 form 1",
                        "required": "1",
                        "urutan": 1,
                        "tipe": "radio",
                        "option": [
                            {
                                "nilai" :"a"
                            },
                            {
                                "nilai" :"b"
                            },
                            {
                                "nilai" :"c"
                            }
                        ]
                    }
                ]
            },
            {
                "judul": "BAGIAN 3",
                "deskripsi": null,
                "pertanyaan": [
                    {
                        "pertanyaan": "Pertanyaan 1 bagian 2 form 1?",
                        "deskripsi": "deskripsi pertanyaan 1 bagian 2 form 1",
                        "required": "1",
                        "urutan": 1,
                        "tipe": "checkbox",
                        "option": [
                            {
                                "nilai": "a"
                            },
                            {
                                "nilai": "b"
                            },
                            {
                                "nilai": "c"
                            }
                        ]
                    }
                ]
            }
        ]
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res){
        var expecteOutput = "success"
        t.error(err, 'No error');
        t.same(res.body.status, expecteOutput, 'Buat form as expected');
        t.end();
    });

});
test.onFinish(() => process.exit(0));
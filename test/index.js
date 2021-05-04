'use strict';

var test = require('tape');
var request = require('supertest');
var app = require('../server');

 
test('Test buat from', function (t) {
    request(app)
        .post('/buatform')
        .send({
            "user_id": "1",
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
        .end(function (err, res) {
            var expecteOutput = "success"
            t.error(err, 'No error');
            t.same(res.body.status, expecteOutput, 'Buat form as expected');
            t.end();
        });

});

test('Test correct list of forms returned', function (t) {
    request(app)
        .get('/listOfForms')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
            var expectedUsers =
            {
                "id": 89,
                "title": "Survei Manajemen Waktu",
                "owner": "user",
                "image": {
                    "name": "Survei Manajemen Waktu",
                    "path": "/images/2b11mssLbueu50KNaGhPdw6dOfeD5l58iKGarFS44wdkKtNSwBolYSpS.jpg"
                },
                "time": 1619218591
            }

            t.error(err, 'No error');
            t.same(res.body[0], expectedUsers, 'List of forms as expected');
            t.end();
        });
});

test('Test get list of questions of survey', function (t) {
    request(app)
        .get('/formQuestions/90')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
            var expectedRes =
            {
                "id_form": "90",
                "pembuat": "nanda",
                "judulForm": "Apakah kamu suka bermain dadu?",
                "time": 1619242567,
                "image": {
                    "name": "Apakah kamu suka bermain dadu?",
                    "path": "/images/2b11q2mTKQCnhVAPqJLjH2iXva7rTqkhK7d0gbOlc64eUCkWYddBq9Ua.jpg"
                },
                "pertanyaan": [
                    {
                        "judul": "Apakah kamu suka bermain dadu?",
                        "bagian": 0,
                        "deskripsi": "Deskripsi",
                        "pertanyaan": [
                            {
                                "pertanyaan": "Apakah kamu suka bermain dadu?",
                                "id_form_field": 268,
                                "deskripsi": "Question description",
                                "required": "1",
                                "urutan": 0,
                                "tipe": "radio",
                                "option": [
                                    {
                                        "nilai": "Tidak",
                                        "id_form_option": 340
                                    },
                                    {
                                        "nilai": "Bisa jadi",
                                        "id_form_option": 341
                                    }
                                ]
                            },
                            {
                                "pertanyaan": "Angka berapa yang paling kamu suka pada dadu?",
                                "id_form_field": 269,
                                "deskripsi": "Question description 2",
                                "required": "1",
                                "urutan": 1,
                                "tipe": "radio",
                                "option": [
                                    {
                                        "nilai": "1",
                                        "id_form_option": 342
                                    },
                                    {
                                        "nilai": "2",
                                        "id_form_option": 343
                                    },
                                    {
                                        "nilai": "3",
                                        "id_form_option": 344
                                    },
                                    {
                                        "nilai": "4",
                                        "id_form_option": 345
                                    },
                                    {
                                        "nilai": "5",
                                        "id_form_option": 346
                                    },
                                    {
                                        "nilai": "6",
                                        "id_form_option": 347
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }

            t.error(err, 'No error');
            t.same(res.body, expectedRes, 'List of questions as expected');
            t.end();
        });

});

test('Test search list of forms with specific keyword', function (t) {
    request(app)
        .get('/listOfForms/dadu')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
            var expectedSearch =
                {
                    "id": 90,
                    "title": "Apakah kamu suka bermain dadu?",
                    "owner": "nanda",
                    "image": {
                        "name": "Apakah kamu suka bermain dadu?",
                        "path": "/images/2b11q2mTKQCnhVAPqJLjH2iXva7rTqkhK7d0gbOlc64eUCkWYddBq9Ua.jpg"
                    },
                    "time": 1619242567
                }

            t.error(err, 'No error');
            t.same(res.body[0], expectedSearch, 'List of forms as expected');
            t.end();
        });
});

test('Test Login with right credentials', function (t) {
    request(app)
        .post('/login')
        .send({
            email: 'user@gmail.com',
            password: 'password'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
            let expectedResult = {
                "login": "Success"
            }

            t.error(err, 'No error');
            t.same(res.body, expectedResult, 'Login successful');
            t.end();
        })
})

test('Test Register', function(t){
    request(app)
    .post('/register')
    .send({
        email: "user12@gmail.com",
        password: "password",
        contactNumber: "081224232232",
        gender: "F",
        address: "Taman Rahayu Selatan no 18 Bandung",
        birthday: "22-02-2013"
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
        let expectedResult = { error: 'Email has been taken' }
        t.error(err, 'No error');
        t.same(res.body, expectedResult, 'Register successful');
        t.end();
    })
})

test.onFinish(() => process.exit(0));
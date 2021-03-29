'use strict';

var test = require('tape');
var request = require('supertest');
var app = require('../server');



// edit zaidan 
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
                "id": 1,
                "title": "dummy",
                "owner": "user"
            };

            t.error(err, 'No error');
            t.same(res.body[0], expectedUsers, 'List of forms as expected');
            t.end();
        });
});

test('Test get list of questions of survey', function (t) {
    request(app)
        .get('/formQuestions/5')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
            var expectedRes =

            {
                "id_form": "5",
                "pembuat": "user",
                "judulForm": "YUHUHUHU dummy",
                "pertanyaan": [
                    {
                        "judul": "BAGIAN 1",
                        "bagian": 0,
                        "deskripsi": "YUHUHUHU dummy",
                        "pertanyaan": [
                            {
                                "pertanyaan": "YUHUHUHU (dummy)Kenapa Spongebob warnanya kuning?",
                                "id_form_field": 10,
                                "deskripsi": "kemukakan jawaban anda mengenai warna kuning dari spongebob",
                                "required": "1",
                                "urutan": 0,
                                "tipe": "short_answer",
                                "option": []
                            },
                            {
                                "pertanyaan": "YUHUHUHU Pertanyaan 2 bagian 0 form 1?",
                                "id_form_field": 11,
                                "deskripsi": "deskripsi pertanyaan 2 form 1",
                                "required": "1",
                                "urutan": 1,
                                "tipe": "short_answer",
                                "option": []
                            }
                        ]
                    },
                    {
                        "judul": "BAGIAN 2",
                        "bagian": 1,
                        "deskripsi": null,
                        "pertanyaan": [
                            {
                                "pertanyaan": "YUHUHUHU Pertanyaan 1  bagian 1 form 1?",
                                "id_form_field": 12,
                                "deskripsi": "deskripsi pertanyaan 0 bagian 1 form 1",
                                "required": "1", "urutan": 0,
                                "tipe": "radio",
                                "option": [
                                    { "nilai": "YUHUHUHUa", "id_form_option": 10 },
                                    { "nilai": "YUHUHUHUb", "id_form_option": 11 },
                                    { "nilai": "YUHUHUHUc", "id_form_option": 12 }
                                ]
                            }
                        ]
                    },
                    {
                        "judul": "BAGIAN 3",
                        "bagian": 2,
                        "deskripsi": null,
                        "pertanyaan": [
                            {
                                "pertanyaan": "YUHUHUHU Pertanyaan 1 bagian 2 form 1?",
                                "id_form_field": 13,
                                "deskripsi": "deskripsi pertanyaan 1 bagian 2 form 1",
                                "required": "1",
                                "urutan": 0,
                                "tipe": "checkbox",
                                "option": [
                                    { "nilai": "YUHUHUHUa", "id_form_option": 13 },
                                    { "nilai": "YUHUHUHUb", "id_form_option": 14 },
                                    { "nilai": "YUHUHUHUc", "id_form_option": 15 }
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
        .get('/listOfForms/dummy2')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
            var expectedSearch =
            {
                "id": 2,
                "title": "dummy2",
                "owner": "user"
            };

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
                "email": "user@gmail.com",
                "role": "admin",
                "login": "Success"
            }

            t.error(err, 'No error');
            t.same(res.body, expectedResult, 'Login successful');
            t.end();
        })
})

test.onFinish(() => process.exit(0));
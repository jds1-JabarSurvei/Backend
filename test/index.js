'use strict';

var test = require('tape');
var request = require('supertest');
var app = require('../server');

test('Test correct list of forms returned', function(t){
    request(app)
    .get('/listOfForms')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res){
        var expectedUsers = [
            {
                "idForm": 1,
                "namaForm": "dummy",
                "pembuat": "user"
            },
            {
                "idForm": 2,
                "namaForm": "dummy2",
                "pembuat": "user"
            }
        ];

        t.error(err, 'No error');
        t.same(res.body, expectedUsers, 'List of forms as expected');
        console.log("Lookk dulu");
        console.log(res.body);
        t.end();
        console.log("Selesai");
    });
});
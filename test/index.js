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
        var expectedFirstUser =
            {
                "id": 1,
                "title": "dummy",
                "owner": "user"
            };

        t.error(err, 'No error');
        t.same(res.body[0], expectedFirstUser, 'List of forms as expected');
        t.end();
    });
});

test.onFinish(() => process.exit(0));
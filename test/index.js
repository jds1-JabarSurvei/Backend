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
                "id": 1,
                "title": "dummy",
                "owner": "user"
            },
            {
                "id": 2,
                "title": "dummy2",
                "owner": "user"
            },
            {
                "id": 3,
                "title": "dummy",
                "owner": "user"
            },
            {
                "id": 4,
                "title": "NEW dummy",
                "owner": "user"
            },
            {
                "id": 5,
                "title": "YUHUHUHU dummy",
                "owner": "user"
            },
            {
                "id": 6,
                "title": "Untitled Form",
                "owner": "user"
            },
            {
                "id": 7,
                "title": "Tes Submit API Form",
                "owner": "user"
            },
            {
                "id": 8,
                "title": "Tes Submit API Form 2",
                "owner": "user"
            }
        ];

        t.error(err, 'No error');
        t.same(res.body, expectedUsers, 'List of forms as expected');
        t.end();
    });
});

test.onFinish(() => process.exit(0));
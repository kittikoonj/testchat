var mongojs = require('mongojs');

var databaseUrl = 'mongodb://localhost:27017/qimdb';
var collections = ['customers', 'user'];

var connect = mongojs(databaseUrl, collections);

module.exports = {
    connect: connect
};

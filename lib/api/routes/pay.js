// Importing other shit
var Hapi = require('hapi');
var Request = require('request');
var Async = require('async');
// Importing my own shit
var Db = require('../db');
var Config = require('../config');
var Util = require('../utility');
var Proto = require('../proto');


/**
 * Handler for /pay/{id}
 * @type {Object}
 */
exports.get = {
  handler: function (request) {
    console.log(' [PAY]: ' + request.params.id);
    var id = Util.idToDBIndex(request.params.id);
    request.reply("this is db index: " + id);
    // internals.getPublicKeyHash('16UwLL9Risc3QfPqBUvKofHmBQ7wMtjvM');
    // internals.testOutput();
  }
};
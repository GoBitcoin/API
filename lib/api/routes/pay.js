// Importing other shit
var Hapi = require('hapi');
var Request = require('request');
var Async = require('async');
// Importing my own shit
var Db = require('../db');
var Config = require('../config');
var Util = require('../utility');
var Proto = require('../proto');
// Private shit
var internals = {};

internals.dbHandler = function (prBuffer) {
  if (prBuffer) {
    console.log("We are getting the buffer from db");
    internals.reply.source = prBuffer;
    internals.reply.variety = 'buffer'; // or 'stream'
    internals.reply('success').type('application/bitcoin-payment-request');
  } else {
    var error = Hapi.error.notFound('Provided id not found in our database, try again later!');
    error.reformat();
    internals.reply(error)
  }

}

/**
 * Handler for /pay/{id}
 * @type {Object}
 */
exports.get = {
  handler: function (request, reply) {
    console.log(' [PAY]: ' + request.params.id);
    var id = Util.idToDBIndex(request.params.id);
    // request.reply("this is db index: " + id);
    internals.reply = reply || request.reply || {};
    Db.getPaymentRequestForId(id, internals.dbHandler);
  }
};
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
    console.log("[pay:dbHandler]: protoBuf: \n" + prBuffer.encode);
    prBuffer = new Buffer(prBuffer.encode, 'hex');
    console.log(prBuffer);
    //verifying
    internals.reply(prBuffer)
      .header('Expires', '0')
      .header('Content-Type', 'application/bitcoin-paymentrequest');
    // .encoding('binary');
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
    // console.log(request);
    console.log(' [PAY]: ' + request.params.id);
    var id = Util.idToDBIndex(request.params.id);
    internals.reply = reply || request.reply || {};
    Db.getPaymentRequestForId(id, internals.dbHandler);
  }
};
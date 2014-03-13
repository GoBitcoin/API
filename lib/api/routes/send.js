// Importing other shit
var Hapi = require('hapi');
var Request = require('request');
var Async = require('async');
// Importing my own shit
var Proto = require('../proto');
var Db = require('../db');
var Config = require('../config');
var Util = require('../utility');
// Private shit
var internals = {};

internals.postToBTCS = function (callback) {

};

/**
 * Handler for /send/{id}
 * @type {Object}
 */
exports.post = {
  handler: function (request) {
    console.log(request.payload);
    var paymentBuf = request.payload;
    var deserializedPayment = Proto.deserializePayment(paymentBuf);

    console.log(' [SEND]: ' + request.params.id);
    var id = Util.idToDBIndex(request.params.id);
    request.reply("this is db index: " + id);
    var dbCallback = function (result) {
      if (result) {
        console.log("found!");
        var deserializedPR = Proto.deserializePaymentRequest(result);
        var broadcastPaymentObj = {
          paymentRequest: deserializedPR,
          payment: deserializedPayment
        };
        var serializedBroadcast = Proto.serializeBroadcastPayment(broadcastPaymentObj);
        var post_options = {
          url: Config.BTCS.uri,
          method: 'POST',
          headers: {
            'Content-Type ': 'application/octet-stream',
            'Content-Length ': serializedBroadcast.length,
            'Accept': 'application/octet-stream'
          },
          body: serializedBroadcast
        };
        var reqCallback = function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log("success!");
          } else {
            console.log('[postToPRS]: status: ' + response.statusCode);
            console.log('[postToPRS]: error: ' + error);
            console.log(JSON.stringify(response));
          }
        };
        // Set up the request
        Request(post_options, reqCallback);

      } else {
        console.log('no result');
      }
    };
    Db.getPaymentRequestForId(id, dbCallback);
  }
};
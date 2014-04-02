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

internals.createBroadcastPayment = function (pBuffer, prBuffer) {
  //payment
  var deserializedPayment = Proto.deserializePayment(pBuffer);
  //payment request
  var deserializedPR = Proto.deserializePaymentRequest(prBuffer);
  //broadcast obj
  var broadcastPaymentObj = {
    paymentRequest: deserializedPR,
    payment: deserializedPayment
  };
  //serialize broadcast obj
  return Proto.serializeBroadcastPayment(broadcastPaymentObj);
}

internals.postToBTCS = function (broadcastBuffer) {
  var post_options = {
    url: Config.BTCS.uri,
    method: 'POST',
    headers: {
      'Content-Type ': 'application/octet-stream',
      'Content-Length ': broadcastBuffer.length,
      'Accept': 'application/octet-stream'
    },
    body: broadcastBuffer
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
};

/**
 * Handler for /send/{id}
 * @type {Object}
 */
exports.post = {
  payload: 'raw',
  handler: function (request, reply) {
    console.log('[send]');
    console.log(request.rawPayload);
    var paymentBuf = request.rawPayload;

    console.log('[SEND]:' + request.params.id);
    var id = Util.idToDBIndex(request.params.id);
    // request.reply("this is db index: " + id);
    var dbCallback = function (result) {
      if (result) {
        console.log("found!");
        var serializedBroadcast = internals.createBroadcastPayment(paymentBuf, new Buffer(result.encode, 'hex'));
        internals.postToBTCS(serializedBroadcast);
      } else {
        console.log('no result');
      }
    };
    Db.getPaymentRequestForId(id, dbCallback);
  }
};
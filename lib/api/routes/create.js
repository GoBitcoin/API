// Importing other shit
var Hapi = require('hapi');
var Request = require('request');
var Async = require('async');
// Importing bitcore shit
var Address = require('bitcore/Address');
var Script = require('bitcore/Script');
// Importing my own shit
var Proto = require('../proto');
var Db = require('../db');
var Config = require('../config');
var Util = require('../utility');
// Private shit
var internals = {};

internals.generateScript = function (address) {
  var addr = new Address(address);
  var script = Script.createPubKeyHashOut(addr.payload());
  console.log(script);
  return script.buffer;
};

// Private function
// Check if hash already exists in the db
internals.checkDuplication = function (callback) {
  var setPaymentRequest = function (pr) {

  };
  Db.getHash(internals.dbObj.hash, setPaymentRequest, callback);
};



// Private function to add payment details ONLY to the db
// Wrapper functions
internals.insertPaymentDetailsToDB = function (skip, id, callback) {
  if (skip) {
    callback(null, skip, id, null);
  } else {
    Db.insert(internals.dbObj, callback);
  }
};

// private function that grabs id from db insert return and serialize payment details
// to serialize payment details
// param: id - last id in db, from previous waterfall task (insert db)
// param: cb - callback for next waterfall task
internals.serializePaymentDetails = function (skip, id, address, callback) {
  if (skip) {
    callback(null, skip, id, null);
  } else {
    var output = {
      amount: internals.dbObj.amount || 0,
      script: internals.generateScript(address) // TODO: usually one of the standard Script forms
    };
    var paymentDetail = {
      network: "test",
      outputs: [output],
      time: Math.round(+new Date() / 1000),
      memo: internals.dbObj.memo || '',
      paymentUrl: Util.sendURIFromId(id)
    };

    console.log(JSON.stringify(paymentDetail));
    var paymentDetailsSerialized = Proto.serializePaymentDetails(paymentDetail);
    // console.log('paymentDetailsSerialized: ' + paymentDetailsSerialized.length);
    //for next task in async.waterfall
    callback(null, null, id, paymentDetailsSerialized);
  }
};

// Private function to post the protobuf to notary service
internals.postToPRS = function (skip, id, protoBuf, callback) {
  if (skip) {
    callback(null, skip, id, null);
  } else
  if (Buffer.isBuffer(protoBuf)) {
    console.log("[postToPRS]: protoBuf: \n" + protoBuf.toString('hex'));
    console.log(JSON.stringify(protoBuf))
    // var serializedPaymentRequest = Proto.serializePaymentRequest({
    //   serialized_payment_details: new Buffer(protoBuf.toJSON())
    // });
    // console.log("spr: " + serializedPaymentRequest.length);
    // An object of options to indicate where to post to
    var post_options = {
      url: Config.PRS.uri,
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': protoBuf.length,
        'Accept': 'application/octet-stream'
      },
      body: protoBuf,
      encoding: null
    };

    var reqCallback = function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var responseBuffer = response.body;
        callback(null, null, id, response.body);
      } else {
        console.log('[postToPRS]: status: ' + response.statusCode);
        console.log('[postToPRS]: error: ' + error);
        console.log(JSON.stringify(response));
      }
    };
    // Set up the request
    Request(post_options, reqCallback);

  } else {
    console.log("[postToPRS]: Param must be buffer");
    callback("[postToPRS]: Param must be buffer");
  }
};



internals.updateDBWithPaymentRequestBuffer = function (skip, id, prBuffer, callback) {
  if (skip) {
    callback(null, id);
  } else
  if (Buffer.isBuffer(prBuffer)) {
    prBuffer = '' + prBuffer.toString('hex');
    var updateObj = {
      updateKey: 'payment_request',
      updateByte: prBuffer
    };
    console.log(prBuffer);
    Db.updateSingleColumn(id, updateObj, callback);
  }
};

/**
 * Handler for GET /create?address=&amount=&memo=&ackmemo=
 * @type {Object}
 */
exports.get = {
  handler: function (request) {
    console.log(' [CREATE]: ' +
      '\nAddress: ' + request.query.address +
      '\nAmount: ' + request.query.amount +
      '\nMemo: ' + request.query.memo +
      '\nAck Memo: ' + request.query.ackmemo);

    //generate hash from request queries
    var hash = Util.hashForCreateReq(request.query);

    internals.dbObj = {
      address: request.query.address,
      amount: request.query.amount,
      memo: request.query.memo || 'This is an auto generated memo',
      ackmemo: request.query.ackmemo || 'This is an auto generated ack memo',
      hash: hash
    };
    Async.waterfall([
      internals.checkDuplication,
      internals.insertPaymentDetailsToDB,
      internals.serializePaymentDetails,
      internals.postToPRS,
      internals.updateDBWithPaymentRequestBuffer
    ], function (err, id) {
      // Last step, generate the link and outputs
      if (err) {
        console.log(err);
      } else if (id) {
        var hashstr = 'hash: ' + hash;
        request.reply(hashstr + '<br><a href="' + Util.paymentURIFromId(id) + '">' + Util.paymentURIFromId(id) + '</a>');
      }
    });



  },
  validate: {
    query: {
      address: Hapi.types.String().required(),
      amount: Hapi.types.Number().min(0).required(),
      memo: Hapi.types.String(),
      ackmemo: Hapi.types.String()
    }
  }
};

/**
 * Handler for POST /create
 * @type {Object}
 */
exports.post = {
  handler: function (request) {
    console.log(' [CREATE]: ' +
      '\nAddress: ' + request.payload.address +
      '\nAmount: ' + request.payload.amount +
      '\nMemo: ' + request.payload.memo +
      '\nAck Memo: ' + request.payload.ackmemo);

    //generate hash from request queries
    var hash = Util.hashForCreateReq(request.payload);

    internals.dbObj = {
      address: request.payload.address,
      amount: request.payload.amount,
      memo: request.payload.memo || 'This is an auto generated memo',
      ackmemo: request.payload.ackmemo || 'This is an auto generated ack memo',
      hash: hash
    };
    Async.waterfall([
      internals.checkDuplication,
      internals.insertPaymentDetailsToDB,
      internals.serializePaymentDetails,
      internals.postToPRS,
      internals.updateDBWithPaymentRequestBuffer
    ], function (err, id) {
      // Last step, generate the link and outputs
      if (err) {
        console.log(err);
      } else if (id) {
        var hashstr = 'hash: ' + hash;
        request.reply({
          id: id,
          uri: Util.paymentURIFromId(id)
        });
      }
    });



  }
};
var Hapi = require('hapi');
var Request = require('request');
var Async = require('async');

var Address = require('bitcore/Address').class();
var Script = require('bitcore/Script').class();

var Proto = require('../proto');
var Db = require('../db');
var Config = require('../config');
var Util = require('../utility');

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
      network: "main",
      outputs: [output],
      time: Date.now() / 1000,
      memo: internals.dbObj.memo || '',
      payment_url: Util.paymentURIFromId(id)
    };

    var paymentDetailsSerialized = Proto.serializePaymentDetails(paymentDetail);
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

    // An object of options to indicate where to post to
    var post_options = {
      url: Config.PRS.uri,
      method: 'POST',
      headers: {
        'Content-Type ': 'application/octet-stream',
        'Content-Length ': protoBuf.length,
        'Accept': 'application/octet-stream'
      },
      body: protoBuf
    };
    var reqCallback = function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(null, null, id, new Buffer(body, 'ascii'));
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
  }
  var updateObj = {
    updateKey: 'payment_request',
    updateByte: prBuffer
  };
  Db.updateSingleColumn(id, updateObj, callback);
};

/**
 * Handler for /create
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
    var hash = Util.hashForCreateReq(request);

    internals.dbObj = {
      address: request.query.address,
      amount: request.query.amount,
      memo: request.query.memo,
      ackmemo: request.query.ackmemo,
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
        request.reply(hashstr + '<br>' + Util.paymentURIFromId(id));
      }
    });



  },
  validate: {
    query: {
      address: Hapi.types.String().required(),
      amount: Hapi.types.Number().min(0).required(),
      memo: Hapi.types.String().required(),
      ackmemo: Hapi.types.String().required()
    }
  }
};
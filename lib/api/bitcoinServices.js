var Hapi = require('hapi');
var Schema = require('protobuf').Schema;
var FS = require('fs');
var Request = require('request');
var Async = require('async');

var Db = require('./db');
var Config = require('./config');
var Util = require('./utility');

var internals = {
  bitcoinSchema: new Schema(FS.readFileSync('lib/api/protos/bitcoin.desc')),
  bitcoinServerSchema: new Schema(FS.readFileSync('lib/api/protos/bitcoinserver.desc')),
  paymentRequestSchema: new Schema(FS.readFileSync('lib/api/protos/paymentrequest.desc'))
};

// private function that grabs id from db insert return and serialize payment details
// to serialize payment details
// param: id - last id in db, from previous waterfall task (insert db)
// param: cb - callback for next waterfall task
internals.serializePaymentDetails = function (id, cb) {
  var output = {
    amount: internals.dbObj.amount || 0,
    script: {} // TODO: usually one of the standard Script forms
  };
  var paymentDetail = {
    network: "main",
    outputs: [output],
    time: Date.now() / 1000,
    memo: internals.dbObj.memo || '',
    payment_url: Util.paymentURIFromId(id)
  };

  var paymentDetailsProto = internals.paymentRequestSchema['payments.PaymentDetails'];
  var paymentDetailsSerialized = paymentDetailsProto.serialize(paymentDetail);
  //for next task in async.waterfall
  cb(null, id, paymentDetailsSerialized);
};

// private function to deserialize payment details
// param: payment detail buffer
internals.deserializePaymentDetails = function (pdBuffer) {
  var paymentDetailsProto = internals.paymentRequestSchema['payments.PaymentDetails '];
  var paymentDetailsDeserialized = paymentDetailsProto.parse(pdBuffer);
  return paymentDetailsDeserialized;
};

// private function to deserialize payment request
// Will automatically print deserialized payment details (comment out in production)
// param: payment request buffer
internals.deserializePaymentRequest = function (prBuffer) {
  if (Buffer.isBuffer(prBuffer)) {
    var paymentRequestProto = internals.paymentRequestSchema['payments.PaymentRequest '];
    var paymentRequestDeserialized = paymentRequestProto.parse(prBuffer);
    console.log('Deserialized PayReq: ', JSON.stringify(paymentRequestDeserialized));
    var paymentDetailsDeserialized = internals.deserializePaymentDetails(paymentRequestDeserialized.serializedPaymentDetails);
    console.log('Deserialized PayDet: ', JSON.stringify(paymentDetailsDeserialized));
    return paymentRequestDeserialized;
  } else if (typeof prBuffer == 'string ' || prBuffer instanceof String) {
    return internals.deserializePaymentRequest(new Buffer(prBuffer, 'ascii '));
  } else {
    console.log("[deserializePaymentRequest]: Param must be buffer/string");
  }
};

// Private function to add payment details ONLY to the db
// Wrapper functions
internals.insertPaymentDetailsToDB = function (callback) {
  Db.insert(internals.dbObj, callback);
};

// Private function to post the protobuf to notary service
internals.postToPRS = function (protoBuf, callback) {
  if (Buffer.isBuffer(protoBuf)) {

    // An object of options to indicate where to post to
    var post_options = {
      url: Config.PRS.uri,
      method: '    POST ',
      headers: {
        'Content - Type ': 'application / octet - stream',
        'Content - Length ': protoBuf.length,
        'Accept ': 'application / octet - stream'
      },
      body: protoBuf
    };
    var reqCallback = function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // return internals.deserializePaymentRequest(body);
        return new Buffer(body, 'ascii');
      } else {
        console.log('[postToPRS]: status: ' + response.statusCode);
        console.log('[postToPRS]: error: ' + error);
        console.log(JSON.stringify(response));
      }
    };
    // Set up the request
    callback(null, Request(post_options, reqCallback));
  } else {
    console.log("[postToPRS]: Param must be buffer");
    callback("[postToPRS]: Param must be buffer");
  }
};

internals.updateDBWithPaymentRequestBuffer = function (id, prBuffer, callback) {
  var updateObj = {
    updateKey: 'payment_request',
    updateValue: prBuffer
  };
  Db.updateSingleColumn(id, updateObj, callback);
};

/**
 * Handler for /get/{id}
 * @type {Object}
 */
exports.get = {
  handler: function (request) {
    console.log(' [GET]: ' + request.params.id);
    var id = Util.idToDBIndex(request.params.id);
    request.reply("this is db index: " + id);
  }
};

/**
 * Handler for /pay/{id}
 * @type {Object}
 */
exports.pay = {
  handler: function (request) {
    console.log(' [PAY]: ' + request.params.id);
    var id = Util.idToDBIndex(request.params.id);
    request.reply("this is db index: " + id);
  }
};

/**
 * Handler for /create
 * @type {Object}
 */
exports.create = {
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
        request.reply(hashstr + '\n' + Util.paymentURIFromId(id));
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
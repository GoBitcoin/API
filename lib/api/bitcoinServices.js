var Hapi = require('hapi');
var Schema = require('protobuf').Schema;
var fs = require('fs');
var request = require('request');
require('buffertools').extend();

var Db = require('./db');
var Config = require('./config');
var Util = require('./utility');

var internals = {
  bitcoinSchema: new Schema(fs.readFileSync('lib/api/protos/bitcoin.desc')),
  bitcoinServerSchema: new Schema(fs.readFileSync('lib/api/protos/bitcoinserver.desc')),
  paymentRequestSchema: new Schema(fs.readFileSync('lib/api/protos/paymentrequest.desc'))
};

// private function to serialize payment details
// param: request object
// param: id
internals.serializePaymentDetails = function (request, id) {
  var output = {
    amount: request.query.amount,
    script: {} // TODO: usually one of the standard Script forms
  };
  var paymentDetail = {
    network: "main",
    outputs: [output],
    time: Date.now() / 1000,
    memo: request.query.memo,
    payment_url: Util.paymentURIFromId(id)
  };

  var paymentDetailsProto = internals.paymentRequestSchema['payments.PaymentDetails'];
  var paymentDetailsSerialized = paymentDetailsProto.serialize(paymentDetail);
  return paymentDetailsSerialized;
};

// private function to deserialize payment details
// param: payment detail buffer
internals.deserializePaymentDetails = function (pdBuffer) {
  var paymentDetailsProto = internals.paymentRequestSchema['payments.PaymentDetails'];
  var paymentDetailsDeserialized = paymentDetailsProto.parse(pdBuffer);
  return paymentDetailsDeserialized;
};

// private function to deserialize payment request
// Will automatically print deserialized payment details (comment out in production)
// param: payment request buffer
internals.deserializePaymentRequest = function (prBuffer) {
  if (Buffer.isBuffer(prBuffer)) {
    var paymentRequestProto = internals.paymentRequestSchema['payments.PaymentRequest'];
    var paymentRequestDeserialized = paymentRequestProto.parse(prBuffer);
    console.log('Deserialized PayReq:', JSON.stringify(paymentRequestDeserialized));
    var paymentDetailsDeserialized = internals.deserializePaymentDetails(paymentRequestDeserialized.serializedPaymentDetails);
    console.log('Deserialized PayDet:', JSON.stringify(paymentDetailsDeserialized));
    return paymentRequestDeserialized;
  } else if (typeof prBuffer == 'string' || prBuffer instanceof String) {
    return internals.deserializePaymentRequest(new Buffer(prBuffer, 'ascii'));
  } else {
    console.log("[deserializePaymentRequest]: Param must be buffer/string");
  }
};

// Private function to post the protobuf to notary service
internals.postToPRS = function (protoBuf) {
  if (Buffer.isBuffer(protoBuf)) {

    // An object of options to indicate where to post to
    var post_options = {
      url: Config.PRS.uri,
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': protoBuf.length,
        'Accept': 'application/octet-stream'
      },
      body: protoBuf
    };
    var callback = function (error, response, body) {
      if (!error && response.statusCode == 200) {
        internals.deserializePaymentRequest(body);
      } else {
        console.log('[postToPRS]: status: ' + response.statusCode);
        console.log('[postToPRS]: error: ' + error);
        console.log(JSON.stringify(response));
      }
    }
    // Set up the request
    request(post_options, callback);
  } else {
    console.log("[postToPRS]: Param must be buffer");
  }
};

/**
 * Handler for /get/{id}
 * @type {Object}
 */
exports.get = {
  handler: function (request) {
    console.log('[GET]:' + request.params.id);
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
    console.log('[PAY]:' + request.params.id);
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
    console.log('[CREATE]:' +
      '\nAddress: ' + request.query.address +
      '\nAmount:' + request.query.amount +
      '\nMemo:' + request.query.memo +
      '\nAck Memo:' + request.query.ackmemo);

    //generate hash from request queries
    var hash = Util.hashForCreateReq(request);

    var dbObj = {
      address: request.query.address,
      amount: request.query.amount,
      memo: request.query.memo,
      ackmemo: request.query.ackmemo,
      hash: hash
    }
    //insert one row into the db
    Db.insert(dbObj);

    //send create db request, get the next db index, convert to id
    var id = Util.dbIndexToId(Db.nextIndex());

    //Serialize payment details
    var serializedPaymentDetails = internals.serializePaymentDetails(request, id);

    //post to signing server, get response
    var resp = internals.postToPRS(serializedPaymentDetails);

    //deserialize the response and cache it in db
    // var deserializedPaymentRequest = internals.deserializePaymentRequest(resp);

    var hashstr = "hash: " + hash;
    request.reply(hashstr);
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
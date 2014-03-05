var Hapi = require('hapi');
var Schema = require('protobuf').Schema;
var fs = require('fs');
var request = require('request');

var Db = require('./db');
var Config = require('./config');
var Util = require('./utility');

var internals = {
  bitcoinSchema: new Schema(fs.readFileSync('lib/api/protos/bitcoin.desc')),
  bitcoinServerSchema: new Schema(fs.readFileSync('lib/api/protos/bitcoinserver.desc')),
  paymentRequestSchema: new Schema(fs.readFileSync('lib/api/protos/paymentrequest.desc'))
};

internals.serializePaymentDetails = function (request) {
  var output = {
    amount: request.query.amount,
    script: {} // TODO: usually one of the standard Script forms
  }
  var paymentDetail = {
    network: "main",
    outputs: [output],
    time: Date.now() / 1000,
    memo: request.query.memo,
    payment_url: Util.paymentURIFromId(id)
  };

  var paymentDetailsProto = internals.paymentRequestSchema['payments.PaymentDetails'];
  var paymentDetailsSerialized = paymentDetailsProto.serialize(paymentDetail);
  console.log('paymentDetailsSerialized.length:', paymentDetailsSerialized.length);
  console.log('typeof: ' + typeof paymentDetailsSerialized + ' isbuffer:' + Buffer.isBuffer(paymentDetailsSerialized));
  return paymentDetailsSerialized;
}

internals.postToPRS = function (protoBuf) {
  if (Buffer.isBuffer(protoBuf)) {

    // An object of options to indicate where to post to
    var post_options = {
      url: Config.PRS.uri,
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': protoBuf.length
      },
      body: protoBuf
    };
    var callback = function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var bodyJson = JSON.parse(body);
        console.log(bodyJson);
      }
    }
    // Set up the request
    request(post_options, callback);
  } else {
    console.log("Protobuf is not buffer");
  }
}

internals.deserializePaymentRequest = function (prBuffer) {
  if (Buffer.isBuffer(prBuffer)) {
    var paymentRequestProto = internals.paymentRequestSchema['payments.PaymentRequest'];
    var paymentRequestDeserialized = paymentRequestProto.parse(prBuffer);
    console.log('unserialised:', JSON.stringify(paymentRequestDeserialized));
    return paymentRequestDeserialized;
  }
}

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

    //send create db request, get the next db index, convert to id
    var id = Util.dbIndexToId(Db.nextIndex());

    //Serialize payment details
    var serializedPaymentDetails = internals.serializePaymentDetails(request);

    //post to signing server, get response
    var resp = internals.postToPRS(paymentDetailsSerialized);

    //deserialize the response and cache it in db
    var deserializedPaymentRequest = internals.deserializePaymentRequest(resp);

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
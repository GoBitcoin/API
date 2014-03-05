var Hapi = require('hapi');
var Schema = require('protobuf').Schema;
var fs = require('fs');

var Db = require('./db');
var Config = require('./config');
var Util = require('./utility');

var internals = {
  bitcoinSchema: new Schema(fs.readFileSync('lib/api/protos/bitcoin.desc')),
  bitcoinServerSchema: new Schema(fs.readFileSync('lib/api/protos/bitcoinserver.desc')),
  paymentRequestSchema: new Schema(fs.readFileSync('lib/api/protos/paymentrequest.desc'))
};

internals.postToPRS = function (protoBuf) {
  if (Buffer.isBuffer(protoBuf)) {

    // An object of options to indicate where to post to
    var post_options = {
      host: Config.PRS.host,
      port: Config.PRS.port,
      path: Config.PRS.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': protoBuf.length
      }
    };

    // Set up the request
    var post_req = http.request(post_options, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('Response: ' + chunk);
        //return the chunks here
      });
    });

    // post the data
    post_req.write(protoBuf);
    post_req.end();
  }
}

exports.get = {
  handler: function (request) {
    console.log('[GET]:' + request.params.id);
    var id = Util.idToDBIndex(request.params.id);
    request.reply("this is db index: " + id);
  }
};

exports.pay = {
  handler: function (request) {
    console.log('[PAY]:' + request.params.id);
    var id = Util.idToDBIndex(request.params.id);
    request.reply("this is db index: " + id);
  }
};

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

    //post to signing server
    internals.postToPRS(paymentDetailsSerialized);

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
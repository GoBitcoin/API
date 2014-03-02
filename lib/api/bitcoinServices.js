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

    var hash = Util.hashForCreateReq(request);

    var id = "hash: " + hash;
    request.reply(id);
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
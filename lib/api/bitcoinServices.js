var Hapi = require('hapi');
var Db = require('./db');
var Config = require('./config');
var Util = require('./utility');

var internals = {};

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
  handler: function () {
    console.log('[CREATE]:' +
      '\nAddress: ' + request.query.address +
      '\nAmount:' + request.query.amount +
      '\nMemo:' + request.query.memo +
      '\nAck Memo:' + request.query.ackmemo);

    var id = "this is the returned it returned from db creation";
    request.reply(id);
  },
  validate: {
    query: {
      address: Hapi.types.String().required(),
      amount: Hapi.types.Number().min(0),
      memo: Hapi.types.String(),
      ackmemo: Hapi.types.String()
    }
  }
};
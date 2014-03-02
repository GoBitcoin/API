var Hapi = require('hapi');
var Db = require('./db');
var Config = require('./config');
var Utility = require('./utility');

var internals = {};

exports.get = {
  handler: function (request) {
    console.log('[GET]:' + request.params.id);
  }
};

exports.pay = {
  handler: function (request) {
    console.log('[PAY]:' + request.params.id);
  }
};

exports.create = {
  handler: function () {
    console.log('[CREATE]:' +
      '\nAddress: ' + request.query.address +
      '\nAmount:' + request.query.amount +
      '\nMemo:' + request.query.memo +
      '\nAck Memo:' + request.query.ackmemo);
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
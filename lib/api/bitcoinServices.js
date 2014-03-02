var Hapi = require('hapi');
var Db = require('./db');
var Config = require('./config');
var Utility = require('./utility');

var internals = {};

exports.get = {
  handler: function (request) {
    console.log("[GET]:");
  },
  validate: {}
};

exports.pay = {
  handler: function (request) {
    console.log("[PAY]:");
  },
  validate: {}
};

exports.create = {
  handler: function () {
    console.log("[CREATE]:");
  },
  validate: {}
};
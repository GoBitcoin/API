var _ = require('underscore');
var Crypto = require('crypto');
var nb61 = require('new-base-61');
var Config = require('./config');
var Bignum = require('bignum');

//TODO: need to redo this with big int
// Convert string to 61 base number
exports.idToDBIndex = function (s) {
  return nb61.strtonum(s);
};

exports.dbIndexToId = function (i) {
  return nu61.numtostr(i)
};

var MD5 = exports.MD5 = function (data) {
  return Crypto.createHash('md5').update(data).digest('hex').toString();
};

// we take md5 of each piece of request and XOR the hashes to generate has to store to DB
exports.hashForCreateReq = function (request) {
  var hash = Bignum(MD5(request.query.address), 16).xor(MD5(request.query.amount)).xor(MD5(request.query.memo)).xor(MD5(request.query.ackmemo));
  return hash.toString(16);
};

exports.paymentURIFromId = function (id) {
  return Config.server.api.uri + '/pay/' + id;
};
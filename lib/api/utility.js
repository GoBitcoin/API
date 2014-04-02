var _ = require('underscore');
var Crypto = require('crypto');
var b62 = require('base62');
var Config = require('./config');
var Bignum = require('bignum');
var Base58 = require('base58-native');

//TODO: need to redo this with big int
// Convert string to 61 base number
exports.idToDBIndex = function (s) {
  //our index starts at 1
  return b62.decode(s);
};

exports.dbIndexToId = function (i) {
  return b62.encode(i);
};

var MD5 = exports.MD5 = function (data) {
  data = data || ''
  return Crypto.createHash('md5').update(data).digest('hex').toString();
};

// we take md5 of each piece of request and XOR the hashes to generate hash to store to DB
exports.hashForCreateReq = function (request) {
  var hash = Bignum(MD5(request.address), 16).xor(MD5(request.amount)).xor(MD5(request.memo)).xor(MD5(request.ackmemo));
  return hash.toString(16);
};

exports.paymentURIFromId = function (id) {
  return Config.server.api.uri + '/pay/' + id;
};

exports.sendURIFromId = function (id) {
  return Config.server.api.uri + '/send/' + id;
}

//Bitcoin utils
var sha256 = exports.sha256 = function (data) {
  return new Buffer(Crypto.createHash('sha256').update(data).digest('binary'), 'binary');
};

var ripe160 = exports.ripe160 = function (data) {
  return new Buffer(Crypto.createHash('rmd160').update(data).digest('binary'), 'binary');
};
var twoSha256 = exports.twoSha256 = function (data) {
  return sha256(sha256(data));
};

var getPublicKeyHash = exports.getPublicKeyHash = function (address) {
  var decodedAddr = Base58.decode(address);
  decodedAddr = '' + decodedAddr.toString('hex');
  if (decodedAddr.length === 50) {
    var ripe160 = decodedAddr.substring(0, 42);
    console.log(ripe160);
    var checksum = decodedAddr.substring(42);
    console.log(checksum);

    //make sure checksum checks out
    //1. Add version byte in front of RIPEMD-160 hash (0x00 for Main Network)
    //2. Perform SHA-256 hash on the extended RIPEMD-160 result
    //3. Perform SHA-256 hash on the result of the previous SHA-256 hash
    //4. Take the first 4 bytes of the second SHA-256 hash. This is the address checksum

    var calculatedCS = Util.twoSha256(new Buffer(ripe160, 'hex'));
    calculatedCS = '' + calculatedCS.toString('hex');
    calculatedCS = calculatedCS.substring(0, 8);
    if (calculatedCS == checksum) {
      console.log("yup, checksum validated");
      return ripe160.substring(2);
    } else {
      console.log("Address not valid, checksum cannot be validated");
    }
  } else {
    console.log("decoded address len: " + decodedAddr.length);
  }
};
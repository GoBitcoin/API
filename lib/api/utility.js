var _ = require('underscore');
var md5 = require('crypto').createHash('md5');;
var nb61 = require('new-base-61');
var Config = require('./config');


// Convert string to 61 base number
exports.idToDBIndex = function (s) {
  return nb61.strtonum(s);
};

exports.dbIndexToId = function (i) {
  return nu61.numtostr(i)
}

exports.MD5 = function (data) {
  return md5.update(data).digest('hex');
}
//TODO: need to redo this with big int
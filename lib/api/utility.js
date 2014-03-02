var _ = require('underscore');
var nb61 = require('new-base-61');
var Config = require('./config');

// Convert string to 61 base number
exports.idToDBIndex = function (s) {
  return nb61.strtonum(s);
};

exports.dbIndexToId = function (i) {
  return nu61.numtostr(i)
}

//TODO: need to redo this with big int
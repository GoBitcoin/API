var redis = require("redis");
var Config = require('./config');

var dbInstance = function () {
  this.initialize();
};

// Optional callback
dbInstance.prototype.initialize = function (cb) {
  dbInstance = redis.createClient(Config.database.development.port, Config.database.development.host);
  dbInstance.on("error", function (err) {
    if (err)
      cb('Database connection error: ' + JSON.stringify(err));
  });
  console.log("DB connected correctly!");
  cb()
};

exports.close = function () {
  dbInstance.end();
};

exports.create = function (queries, cb) {

};

exports.nextId = function () {

};

//singleton db instance
exports = module.exports = dbInstance;
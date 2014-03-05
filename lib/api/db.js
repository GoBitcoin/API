// var redis = require("pg");
var Config = require('./config');

var dbInstance = function () {
  this.initialize();
};

// Optional callback
dbInstance.prototype.initialize = function (cb) {
  // dbInstance = redis.createClient(Config.database.development.port, Config.database.development.host);
  // dbInstance.on("error", function (err) {
  //   if (err)
  //     cb('Database connection error: ' + JSON.stringify(err));
  // });
  // console.log("DB connected correctly!");
  // cb()
  // this = new pg.Client(Config.database.uri);
};

dbInstance.prototype.close = function () {
  this.end();
};

dbInstance.prototype.create = function (queries, cb) {

};

dbInstance.prototype.nextIndex = function () {

};

//singleton db instance
exports = module.exports = new dbInstance();
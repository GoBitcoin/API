var redis = require("redis");
var Config = require('./config');


// Optional callback
exports.initialize = function (cb) {
  var client = redis.createClient(Config.database.development.port, Config.database.development.host);
  client.on("error", function (err) {
    if (err)
      cb('Database connection error: ' + JSON.stringify(err));
  });
  console.log("DB connected correctly!");
  cb()
};
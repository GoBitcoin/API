// Load modules
//

var Config = require('./config');
var Db = require('./db');
var Hapi = require('hapi');
var Routes = require('./routes');

// var getCredentials = function (id, callback) {

//   return callback(null, Vault.hawkTicket[id]);
// };

var server = new Hapi.Server(Config.server.api.host, Config.server.api.port, {
  cors: true
});
server.route(Routes.endpoints);
// server.auth('hawk', {
//     scheme: 'hawk',
//     getCredentialsFunc: getCredentials
// });
// server.auth('bewit', {
//     scheme: 'bewit',
//     getCredentialsFunc: getCredentials
// });

Db.initialize(function (err) {

  if (err) {
    console.log(err);
    process.exit(1);
  }
  server.start(function () {
    console.log("Server started: " + Config.server.api.uri);
  });
});

module.exports = server;
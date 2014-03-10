exports.product = {
  name: 'API'
};

//Server config
exports.server = {
  web: {
    host: 'localhost',
    port: 8000
  },
  api: {
    host: 'localhost',
    port: 8001
  }
};

//signing server
exports.PRS = {
  host: '10.0.2.13',
  port: 8080,
  path: 'sign'
};

//bitcoinJ server
exports.bitcoinJ = {
  host: '',
  port: 1111
};

//database stuff
exports.database = {
  development: {
    host: 'localhost',
    port: 6379,
    db: 'paymentCache'
  },
  staging: {},
  production: {},
  paymentTable: 'paymentTable'
};
exports.server.web.uri = (exports.server.web.tls ? 'https://' : 'http://') + exports.server.web.host + ':' + exports.server.web.port;
exports.server.api.uri = (exports.server.api.tls ? 'https://' : 'http://') + exports.server.api.host + ':' + exports.server.api.port;
exports.PRS.uri = (exports.PRS.tls ? 'https://' : 'http://') + exports.PRS.host + ':' + exports.PRS.port + '/' + exports.PRS.path;
exports.database.development.uri = 'postgres://' + exports.database.development.username + ':' + exports.database.development.password + '@' + exports.database.development.host + '/' + exports.database.development.db;
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
  host: 'localhost',
  port: 8080,
  path: 'sign'
};

//bitcoinJ server
exports.BTCS = {
  host: 'localhost',
  port: 8081,
  path: 'broadcast'
};

//database stuff
exports.database = {
  development: {
    host: 'localhost',
    port: 5432,
    db: 'paymentcache',
    username: 'Joey',
    password: '1111'
  },
  staging: {},
  production: {},
  paymentTable: 'paymenttable'
};
exports.server.web.uri = (exports.server.web.tls ? 'https://' : 'http://') + exports.server.web.host + ':' + exports.server.web.port;
exports.server.api.uri = (exports.server.api.tls ? 'https://' : 'http://') + exports.server.api.host + ':' + exports.server.api.port;
exports.PRS.uri = (exports.PRS.tls ? 'https://' : 'http://') + exports.PRS.host + ':' + exports.PRS.port + '/' + exports.PRS.path;
exports.BTCS.uri = (exports.BTCS.tls ? 'https://' : 'http://') + exports.BTCS.host + ':' + exports.BTCS.port + '/' + exports.BTCS.path;
exports.database.uri = 'postgres://' + exports.database.development.username + ':' + exports.database.development.password + '@' + exports.database.development.host + '/' + exports.database.development.db;
exports.database.db = exports.database.development.db;
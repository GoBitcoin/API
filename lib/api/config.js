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
  host: '',
  port: 1111,
  path: ''
};

//bitcoinJ server
exports.bitcoinJ = {
  host: '',
  port: 1111
};

exports.database = {
  development: {
    host: 'localhost',
    port: 6379,
    db: 'paymentCache'
  },
  staging: {},
  production: {}
};
exports.server.web.uri = (exports.server.web.tls ? 'https://' : 'http://') + exports.server.web.host + ':' + exports.server.web.port;
exports.server.api.uri = (exports.server.api.tls ? 'https://' : 'http://') + exports.server.api.host + ':' + exports.server.api.port;
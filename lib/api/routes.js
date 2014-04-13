// Load modules
var Hapi = require('hapi');
var Create = require('./routes/create');
var Send = require('./routes/send');
var Pay = require('./routes/pay');
var Health = require('./routes/health');
var Web = require('./routes/web');

// API Server Endpoints
exports.endpoints = [{
  method: 'GET',
  path: '/',
  config: Web.get
}, {
  method: 'POST',
  path: '/create',
  config: Create.post
}, {
  method: 'POST',
  path: '/send/{id}',
  config: Send.post
}, {
  method: 'GET',
  path: '/pay/{id}',
  config: Pay.get
}, {
  method: 'GET',
  path: '/health',
  config: Health.get
}];
// Load modules
var Hapi = require('hapi');
var Create = require('./routes/create');
var Send = require('./routes/send');
var Pay = require('./routes/pay');
var Health = require('./routes/health');

// API Server Endpoints
exports.endpoints = [{
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
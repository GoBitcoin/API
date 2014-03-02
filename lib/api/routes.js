// Load modules
var Hapi = require('hapi');
var BitcoinServices = require('./bitcoinServices');

// API Server Endpoints
exports.endpoints = [{
  method: 'POST',
  path: '/create',
  config: BitcoinServices.create
}, {
  method: 'POST',
  path: '/pay/{id}',
  config: BitcoinServices.pay
}, {
  method: 'GET',
  path: '/get/{id}',
  config: BitcoinServices.get
}];
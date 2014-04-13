// Importing other shit
var Hapi = require('hapi');

/**
 * Handler for health check /health/
 * @type {Object}
 */
exports.get = {
  handler: function (request, reply) {
    // console.log(request);
    console.log(' [Health]: checking server health...');
    reply = reply || request.reply;
    reply('success!');
  }
};
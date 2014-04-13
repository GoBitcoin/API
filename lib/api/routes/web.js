var Hapi = require('hapi');
var static = require('node-static');
var path = require("path");
var file = new(static.Server)(path.join(__dirname, "public"));

exports.get = {
  handler: function (request, reply) {
    request.addListener('end', function () {
      file.serve(request, response);
    }).resume();
  }
};
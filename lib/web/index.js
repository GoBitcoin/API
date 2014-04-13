var static = require('node-static');
var http = require('http');
var path = require("path");
var file = new(static.Server)(path.join(__dirname, "public"));

http.createServer(function (request, response) {
  request.addListener('end', function () {
    file.serve(request, response);
  }).resume();
}).listen(8080);
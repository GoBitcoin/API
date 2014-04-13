var Hapi = require('hapi');
var http = require('http');
var fs = require('fs');
var path = require('path');

exports.get = {
  handler: function (request, reply) {
    var filePath = './public' + request.url.path;
    if (filePath == './public/')
      filePath += 'index.html';
    console.log(filePath);

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    }
    fs.exists(filePath, function (exists) {
      if (exists) {
        fs.readFile(filePath, function (error, content) {
          if (error) {
            reply(error);
          } else {
            reply(content).type(contentType);
          }
        });
      } else {
        var error = Hapi.error.notFound('Page not found');
        reply(error);
      }
    });
  }
};
var http = require('http');
var socketio = require('socket.io');
var nstaticServer = require('node-static').Server;


module.exports = (function() {

  var requestHandler = function(request, response) {
    var onRequestEnd = function() {
      file.serve(request, response);
    }
    var file = new nstaticServer('./public');
    request.on("end", onRequestEnd);
  }

  var httpserver = http.createServer(requestHandler);
  var io = socketio.listen(httpserver);

  io.configure(function(){
    io.enable('browser client etag');
    io.enable('browser client minification');
    io.set('log level', 1);
    io.set('transports', [
      'websocket',
      'flashsocket'
    ]);
  });
  
  return {
    'io':io,
    'listen' : function(port, host) {
      httpserver.listen(port, host);
    }
  };

})();

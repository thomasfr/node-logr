/** SERVER **/

var net = require('net');
var util = require('util');
var fs = require('fs');
var http = require('http');
var io = require('socket.io');
var nStatic = require('node-static');

var server = net.createServer(function(socket) {

  socket.setEncoding("UTF8");

  socket.on("connect", function() {
    console.log(socket.remoteAddress+" connected");
  });

  socket.on("data", function(rawData) {
    if(rawData) {
      try {
        rawDataObj = JSON.parse(rawData);
        if(rawDataObj && rawDataObj.type && rawDataObj.type == "event") {
          var rawEventPayload = rawDataObj.payload;
          if(rawEventPayload.message && rawEventPayload.type) {
            var eventTypeHandler = require(rawEventPayload.type).handle;
            var eventPayload = eventTypeHandler(rawEventPayload);
            io.sockets.emit("event", {'payload': eventPayload, 'data': {'sourceIp': this.remoteAddress}});
          }
        }
      } catch (error) {
        console.error("error processing data: " + error);
      }
    }
  });

  socket.on("end", function() {
    console.log("Client '" + this.remoteAddress + "' closed connection");
  });

});


var handler = function(request, response) {
  request.on("end", function() {
    file.serve(request, response);    
  })
}

var file = new nStatic.Server('./public');
var app = http.createServer(handler);
app.listen(8000);
var io = io.listen(app);

server.listen(1234, '127.0.0.1');

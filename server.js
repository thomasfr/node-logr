/** SERVER **/


var net = require('net');
var util = require('util');
var fs = require('fs');
var http = require('http');
var io = require('socket.io');

var server = net.createServer(function(socket) {
  socket.setEncoding("UTF8");
  socket.on("connect", function() {
    console.log(socket.remoteAddress+" connected");
  });
  socket.on("data", function(data) {
    if(data) {
      try {
        dataObject = JSON.parse(data);
        if(dataObject.type && dataObject.type == "event") {
          console.log("Data from " + this.remoteAddress + ": ", dataObject.payload);
          io.sockets.emit("event", {'data': dataObject.payload, 'remote': this.remoteAddress});
        }
      } catch (error) {
        console.info("error sending data "+error);
      }
    }
  });
  socket.on("end", function() {
    console.log("Client '" + this.remoteAddress + "' closed connection");
  });
});


var handler = function(req, res) {
  fs.readFile(__dirname + '/index.html', function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var app = http.createServer(handler);
app.listen(8080);
var io = io.listen(app);
server.listen(1234, '127.0.0.1');


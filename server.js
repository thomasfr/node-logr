/** SERVER **/


var net = require('net');
var util = require('util');

var server = net.createServer(function(socket) {
  socket.setEncoding("UTF8");
  socket.on("connect", function() {
    console.log(socket.remoteAddress+" connected");
  });
  socket.on("data", function(data) {
    console.log("Data from "+this.remoteAddress+": ", JSON.parse(data), "\n"+data+"\n\n");
  });
  socket.on("end", function() {
    console.log(this.remoteAddress+ " ended");
  });
});
server.listen(1234, '127.0.0.1');

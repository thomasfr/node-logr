var net = require('net');

module.exports = (function() {

  var socketio;

  var logserver = net.createServer(function(socket) {

    var onSocketConnect = function() {
      console.log("Client '" + this.remoteAddress + "' connected");
    }

    var onSocketEnd = function() {
      console.log("Client '" + this.remoteAddress + "' closed connection");
    }

    var processEventPayload = function(eventPayload) {
      if(eventPayload && typeof eventPayload.type === "string") {
        return require("logr-" + eventPayload.type).processPayload(eventPayload);
      }
      else {
        return null;
      }
    }

    var getWebsocketEventObject = function(payload, socket) {
      return {
        'payload': payload,
        'meta': {
          'client_ip': socket.remoteAddress
        }
      };
    }

    var onSocketData = function(rawData) {
      if(rawData) {
        try {
          rawDataObj = JSON.parse(rawData);
          if(rawDataObj.type === "event" && rawDataObj.payload) {
            try {
              eventPayload = processEventPayload(rawDataObj.payload);
              if(eventPayload) {
                socketio.sockets.emit("event", getWebsocketEventObject(eventPayload, this));
              }
              else {
                console.log("eventPayload after processing empty - not emiting websocket event");
              }
            }
            catch (error) {
              console.log("Error when processing event payload " + error);
            }
          }
        } catch (error) {
          console.info("error processing data: " + error);
        }
      }
    }

    socket.setEncoding("UTF8");
    socket.on("connect", onSocketConnect );
    socket.on("data", onSocketData );
    socket.on("end", onSocketEnd );
  });

  return {
    listen : function(port, ip, io) {
      socketio = io;
      return logserver.listen(port, ip);
    }
  }

})();

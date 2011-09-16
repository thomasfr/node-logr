var net = require('net');
var nconf = require('nconf');

var EVENT_SERVER_HOST = "127.0.0.1";
var EVENT_SERVER_PORT = 1234;

nconf.use('file', { file: 'config.json' });
nconf.load();


var eventSources = [];

var getEventSources = function() {
  return nconf.get('events') || [];
}

var addEventSource = function(eventSource, callback) {
  var events = getEventSources();
  events.push(eventSource);
  nconf.set('events', events);
  nconf.save(callback);
}

var initializeEventSources = function(connection) {
  var sources = getEventSources(), source, l = sources.length, i = 0, options;
  for(i;i<l;i++) {
    source = sources[i];
    if(source.type) {
      options = source.options || {};
      var eventSource = require("logr-" + source.type).initialize(options, connection);
      console.log("EventSource", eventSource);
      eventSources.push(eventSource);
    }
  }
}

var shutdownEventSources = function() {
  var sources = eventSources, source, l=sources.length, i=0;
  for(i;i<l;i++) {
    source = sources[i];
    if(source && source.shutdown) {
      source.shutdown();
    }
    delete sources[i];
    delete source;
  }
}

var createConnection = function() {

  var connection = net.createConnection(EVENT_SERVER_PORT, EVENT_SERVER_HOST);
  connection.on("connect", function() {
    console.log("Established connection to server '"+EVENT_SERVER_HOST+":"+EVENT_SERVER_PORT+"'");
    connection.setEncoding("UTF8");
    initializeEventSources(this);
  });

  connection.on("end", function() {
    console.log("Connection to server '"+this.remoteAddress+"' got closed from server side.");
    shutdownEventSources();
    setTimeout(createConnection, 1000);
  });

  connection.on("error", function(error) {
    console.info(""+error);
    shutdownEventSources();
    if(error.code == 'ECONNREFUSED') {
      setTimeout(createConnection, 1000);
    }
  });

}
 
module.exports = createConnection();

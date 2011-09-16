/** CLIENT **/

var net = require('net');
var spawn = require('child_process').spawn;
var nconf = require('nconf');

var EVENT_SERVER_HOST = "127.0.0.1";
var EVENT_SERVER_PORT = 1234;


nconf.use('file', { file: 'config.json' });
nconf.load();

var getEventSources = function() {
  return nconf.get('events') || [];
}

var addEventSource = function(eventSource, callback) {
  var events = getEventSources();
  events.push(eventSource);
  nconf.set('events', events);
  nconf.save(callback);
}


var eventSources = [];
var initEventSources = function(connection) {
  var sources = getEventSources(), source, l = sources.length, i = 0;
  for(i;i<l;i++) {
    source = sources[i];
    if(source.type && source.type == "tailf") {
      var tailf = spawn("tailf", ['-n', '1', source.file]);
      eventSources.push(tailf);
      var sourceStream = tailf.stdout;
      sourceStream.setEncoding("UTF8");
      sourceStream.on("data", function(data) {
        connection.write(JSON.stringify(getEventMessage(source, data)));
      });  
      tailf.stderr.on("data", function(data) {
        console.log("Error", data.toString());
      });
    }
  }
}


var shutdownEventSources = function() {
  var sources = eventSources, source, l=sources.length, i=0;
  for(i;i<l;i++) {
    source = sources[i];
    if(source) {
      source.kill();
    }
    source = null;
    sources[i] = null;
    delete source;
    delete sources[i];
  }
}

var createConnection = function() {

  var connection = net.createConnection(EVENT_SERVER_PORT, EVENT_SERVER_HOST, function() {
    console.log("Established connection to '"+connection.remoteAddress+"'");
    connection.setEncoding("UTF8");
    initEventSources(connection);
  });

  connection.on("end", function() {
    console.log("Connection to '"+this.remoteAddress+"' got closed from remote");
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

  return connection;
}
 
var getEventMessage = function(source, data) {
  return {
    "type":"event",
    "payload": {
      "type":source.type,
      "file":source.file,
      "message":JSON.stringify(data)
    },
  };
}

createConnection();

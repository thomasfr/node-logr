var logserver = require('./lib/logserver.js');
var httpserver = require('./lib/httpserver.js');

logserver.listen(1234, '127.0.0.1', httpserver.io);
httpserver.listen(8000);


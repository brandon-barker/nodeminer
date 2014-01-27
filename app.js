'use strict';

var http = require('http'),
    express = require('express'),
    socket = require('./lib/socket'),
    app = express();

/**
 * Main application file
 */

// Default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./lib/config/config');

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app);

// socket.io initialization
var server = http.createServer(app).listen(config.port, "0.0.0.0");
var io = require('socket.io').listen(server);
io.set('log level', 1); // reduce logging

// Listen to socket.io connection
io.sockets.on('connection', socket);

// Expose app
var exports = module.exports = server;
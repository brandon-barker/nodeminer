'use strict';

var http = require('http'),
    express = require('express'),
    _ = require('lodash'),
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

// Create our HTTP server
var server = http.createServer(app).listen(config.port, "0.0.0.0");

// Initialize our services
var settingsService = require('./lib/services/SettingsService.js');
var minerService = require('./lib/services/MinersService.js');
var coinService = require('./lib/services/CoinsService.js');
var poolService = require('./lib/services/PoolsService.js');

// socket.io initialization
var io = require('socket.io').listen(server);

// reduce logging
io.set('log level', 1);

// Listen to socket.io connection
io.sockets.on('connection', function (socket) {
  socket.emit('miners:init', _.sortBy(minerService.miners, 'name'));
  socket.emit('coins:init', _.sortBy(coinService.coins, 'name'));
  socket.emit('pools:init', _.sortBy(poolService.pools, 'name'));
  socket.emit('settings:init', settingsService.settings);

  /*
   *  Socket.IO Event Listeners
   */
  socket.on('save:miners', function (miners) {
    minerService.save(miners);
  });

  socket.on('save:coins', function (coins) {
    coinService.save(coins);
  });

  socket.on('save:pools', function (pools) {
    poolService.save(pools);
  });

  socket.on('save:settings', function (settings) {
    settingsService.save(settings);
  });

  socket.on('reload', function () {
    socket.emit('miners:init', _.sortBy(minerService.miners, 'name'));
    socket.emit('coins:init', _.sortBy(coinService.coins, 'name'));
    socket.emit('pools:init', _.sortBy(poolService.pools, 'name'));
    socket.emit('settings:init', settingsService.settings);
  });

  socket.on('gpu:enable', function (data) {
    minerService.enableGpu(data.miner, data.device);
  });

  socket.on('gpu:disable', function (data) {
    minerService.disableGpu(data.miner, data.device);
  });

  socket.on('update:intensity', function (data) {
    minerService.updateIntensity(data.miner, data.device, data.value);
  });

  socket.on('update:gpuengine', function (data) {
    minerService.updateGpuEngine(data.miner, data.device, data.value);
  });

  socket.on('update:gpumemory', function (data) {
    minerService.updateGpuMemory (data.miner, data.device, data.value);
  });

  socket.on('update:gpuvoltage', function (data) {
    minerService.updateGpuVoltage (data.miner, data.device, data.value);
  });

  socket.on('zero:miner', function (miner) {
    minerService.zeroMiner(miner);
  });

  socket.on('zero:allminers', function () {
    minerService.miners.forEach(function (miner) {
      minerService.zeroMiner(miner);
    });
  });

  socket.on('change:pool', function (data) {
    minerService.changePool(data.miner, data.pool);
  });

  /*
   *  Miner Service Event Listeners
   */
  minerService.on('update', function (miner) {
    socket.emit('miner:config', miner);
  });

  minerService.on('saved', function (miners) {
    socket.emit('saved:miners', miners);
    socket.emit('miners:init', _.sortBy(minerService.miners, 'name'));
  });

  minerService.on('loaded', function (miners) {
    socket.emit('miners:init', miners);
  });

  minerService.on('error:miner', function (data) {
    socket.emit('error:miner', { miner: data.miner, error: data.error });
  });

  minerService.on('fileError', function (msg, data) {
    socket.emit('error:file', { msg: msg, data: data });
  });

  minerService.on('success:gpuenable', function (data) {
    socket.emit('success:gpuenable', data);
  });

  minerService.on('success:gpudisable', function (data) {
    socket.emit('success:gpudisable', data);
  });

  minerService.on('error:gpuenable', function (data) {
    socket.emit('error:gpuenable', data);
  });

  minerService.on('error:gpudisable', function (data) {
    socket.emit('error:gpudisable', data);
  });

  minerService.on('success:intensity', function (data) {
    socket.emit('success:intensity', data);
  });

  minerService.on('error:intensity', function (data) {
    socket.emit('error:intensity', data);
  });

  minerService.on('success:gpuengine', function (data) {
    socket.emit('success:gpuengine', data);
  });

  minerService.on('error:gpuengine', function (data) {
    socket.emit('error:gpuengine', data);
  });

  minerService.on('success:gpumemory', function (data) {
    socket.emit('success:gpumemory', data);
  });

  minerService.on('error:gpumemory', function (data) {
    socket.emit('error:gpumemory', data);
  });

  minerService.on('success:gpuvoltage', function (data) {
    socket.emit('success:gpuvoltage', data);
  });

  minerService.on('error:gpuvoltage', function (data) {
    socket.emit('error:gpuvoltage', data);
  });

  minerService.on('success:zerominer', function (data) {
    socket.emit('success:zerominer', { miner:data.miner, status:data.status });
  });

  minerService.on('error:zerominer', function (data) {
    socket.emit('error:zerominer', { miner:data.miner, status:data.status });
  });

  minerService.on('success:changepool', function (data) {
    socket.emit('success:changepool', { miner: data.miner, pool: data.pool, status: data.status });
  });

  minerService.on('error:changepool', function (data) {
    socket.emit('error:changepool', { miner: data.miner, pool: data.pool, status: data.status });
  });

  /**
   *  Coins Service Event Listeners
   */

  coinService.on('saved', function (coins) {
    socket.emit('saved:coins', coins);
    socket.emit('coins:init', _.sortBy(coinService.coins, 'name'));
  });

  /**
   *  Pool Service Event Listeners
   */

  poolService.on('saved', function (pools) {
    socket.emit('saved:pools', pools);
    socket.emit('pools:init', _.sortBy(poolService.pools, 'name'));
  });

  /**
   *  Settings Service Event Listeners
   */

  settingsService.on('saved', function (settings) {
    socket.emit('saved:settings', settings);
    socket.emit('settings:init', settingsService.settings);
  });
});

// Expose app
var exports = module.exports = server;

'use strict';

var http = require('http'),
    express = require('express'),
    socket = require('./lib/socket'),
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
var MinerService = new (require('./lib/services/MinersService.js'))();
var CoinService = new (require('./lib/services/CoinsService.js'))();
var PoolService = new (require('./lib/services/PoolsService.js'))();

// socket.io initialization
var io = require('socket.io').listen(server);

// reduce logging
io.set('log level', 1);

// Listen to socket.io connection
//io.sockets.on('connection', socket);

io.sockets.on('connection', function (socket) {
  socket.emit('miners:init', _.sortBy(MinerService.miners, 'name'));
  socket.emit('coins:init', _.sortBy(CoinService.coins, 'name'));
  socket.emit('pools:init', _.sortBy(PoolService.pools, 'name'));

  /*
   *  Socket.IO Event Listeners
   */
  socket.on('save:miners', function (miners) {
    MinerService.save(miners);
  });

  socket.on('save:coins', function (coins) {
    CoinService.save(coins);
  });

  socket.on('save:pools', function (pools) {
    PoolService.save(pools);
  });

  socket.on('gpu:enable', function (data) {
    MinerService.enableGpu(data.miner, data.device);
  });

  socket.on('gpu:disable', function (data) {
    MinerService.disableGpu(data.miner, data.device);
  });

  socket.on('update:intensity', function (data) {
    MinerService.updateIntensity(data.miner, data.device, data.value);
  });

  socket.on('update:gpuengine', function (data) {
    MinerService.updateGpuEngine(data.miner, data.device, data.value);
  });

  socket.on('update:gpumemory', function (data) {
    MinerService.updateGpuMemory (data.miner, data.device, data.value);
  });

  socket.on('update:gpuvoltage', function (data) {
    MinerService.updateGpuVoltage (data.miner, data.device, data.value);
  });

  socket.on('zero:miner', function (miner) {
    MinerService.zeroMiner(miner);
  });

  socket.on('zero:allminers', function () {
    MinerService.miners.forEach(function (miner) {
      MinerService.zeroMiner(miner);
    });
  });

  socket.on('change:pool', function (data) {
    MinerService.changePool(data.miner, data.pool);
  });

  /*
   *  Miner Service Event Listeners
   */
  MinerService.on('update', function (miner) {
    socket.emit('miner:config', miner);
  });

  MinerService.on('saved', function (miners) {
    socket.emit('saved:miners', miners);
  });

  MinerService.on('loaded', function (miners) {
    socket.emit('miners:init', miners);
  });

  MinerService.on('error:miner', function (data) {
    socket.emit('error:miner', { miner: data.miner, error: data.error });
  });

  MinerService.on('fileError', function (msg, data) {
    socket.emit('error:file', { msg: msg, data: data });
  });

  MinerService.on('success:gpuenable', function (data) {
    socket.emit('success:gpuenable', data);
  });

  MinerService.on('success:gpudisable', function (data) {
    socket.emit('success:gpudisable', data);
  });

  MinerService.on('error:gpuenable', function (data) {
    socket.emit('error:gpuenable', data);
  });

  MinerService.on('error:gpudisable', function (data) {
    socket.emit('error:gpudisable', data);
  });

  MinerService.on('success:intensity', function (data) {
    socket.emit('success:intensity', data);
  });

  MinerService.on('error:intensity', function (data) {
    socket.emit('error:intensity', data);
  });

  MinerService.on('success:gpuengine', function (data) {
    socket.emit('success:gpuengine', data);
  });

  MinerService.on('error:gpuengine', function (data) {
    socket.emit('error:gpuengine', data);
  });

  MinerService.on('success:gpumemory', function (data) {
    socket.emit('success:gpumemory', data);
  });

  MinerService.on('error:gpumemory', function (data) {
    socket.emit('error:gpumemory', data);
  });

  MinerService.on('success:gpuvoltage', function (data) {
    socket.emit('success:gpuvoltage', data);
  });

  MinerService.on('error:gpuvoltage', function (data) {
    socket.emit('error:gpuvoltage', data);
  });

  MinerService.on('success:zerominer', function (data) {
    socket.emit('success:zerominer', { miner:data.miner, status:data.status });
  });

  MinerService.on('error:zerominer', function (data) {
    socket.emit('error:zerominer', { miner:data.miner, status:data.status });
  });

  MinerService.on('success:changepool', function (data) {
    socket.emit('success:changepool', { miner: data.miner, pool: data.pool, status: data.status });
  });

  MinerService.on('error:changepool', function (data) {
    socket.emit('error:changepool', { miner: data.miner, pool: data.pool, status: data.status });
  });

  /**
   *  Coins Service Event Listeners
   */

  CoinService.on('saved', function (coins) {
    socket.emit('saved:coins', coins);
  });

  /**
   *  Pool Service Event Listeners
   */

  PoolService.on('saved', function (pools) {
    socket.emit('saved:coins', pools);
  });
});

// Expose app
var exports = module.exports = server;
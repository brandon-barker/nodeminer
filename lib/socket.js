var bfgminer = require('./modules/bfgminer'),
  fs = require('fs'),
  _ = require('lodash');

module.exports = function (socket) {
  socket.on('init:coins', function () {
    var file = __dirname + '\\config\\coins.json';

    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        console.log('Error reading coin configuration: ' + err);
        return;
      }

      var coins = JSON.parse(data);

      if (coins.length > 0) {
        socket.emit('coins:init', coins);
      }
    });
  });

  socket.on('init:miners', function () {
    var file = __dirname + '\\config\\miners.json';

    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        console.log('Error reading miner configuration: ' + err);
        return;
      }

      var miners = JSON.parse(data);

      if (miners.length > 0) {
        socket.emit('miners:init', miners);

        miners.forEach(function (miner) {
          bfgminer.init(miner, function (err, data) {
            if (err) {
              socket.emit('miner:error', err);
              return;
            }

            _.merge(miner, data);
            socket.emit('miner:config', miner);
          });
        });
      }
    });
  });

  socket.on('init:pools', function () {
    var file = __dirname + '\\config\\pools.json';

    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        console.log('Error reading pool configuration: ' + err);
        return;
      }

      var pools = JSON.parse(data);

      if (pools.length > 0) {
        socket.emit('pools:init', pools);
      }
    });
  });

  socket.on('config:save:coins', function (coins) {

  });

  socket.on('config:save:miners', function (miners) {

  });

  socket.on('config:save:pools', function (pools) {

  });

  socket.on('gpu:enable', function (miner, device) {
    bfgminer.enableGpu(miner, device);
  });

  socket.on('gpu:disable', function (miner, device) {
    bfgminer.disableGpu(miner, device);
  });
}
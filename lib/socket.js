var bfgminer = require('./modules/bfgminer'),
  fs = require('fs'),
  _ = require('lodash');

module.exports = function (socket) {
  var clients = {};
  clients[socket.id] = socket;

  console.log('A new socket connection has been spawned! ' + socket.id);

  socket.emit('socket:init', socket.id);

  socket.on('init:coins', function () {
    var file = __dirname + '\\config\\coins.json';

    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        console.log('Error reading coin configuration: ' + err);
        return;
      }

      clients[socket.id].coins = JSON.parse(data);

      if (clients[socket.id].coins.length > 0) {
        socket.emit('coins:init', clients[socket.id].coins);
      }
    });
  });

  socket.on('init:miners', function () {
    var file = __dirname + '\\config\\miners.json';

    if (!socket.disconnected) {
      fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
          console.log('Error reading miner configuration: ' + err);
          return;
        }

        clients[socket.id].miners = JSON.parse(data);

        if (clients[socket.id].miners.length > 0) {
          socket.emit('miners:init', socket.miners);

          clients[socket.id].miners.forEach(function (miner) {
            bfgminer.init(miner, function (err, data) {
              if (err) {
                socket.emit('miner:error', err);
                return;
              }

              _.merge(miner, data);
              socket.emit('miner:config', miner);
            }, socket);
          });
        }
      });
    }
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
    var file = __dirname + '\\config\\coins.json';

    fs.writeFile(file, JSON.stringify(coins, null, 4), function(err) {
      if(err) {
        console.log(err);
      } else {
        socket.emit('saved:coins', coins);
      }
    });
  });

  socket.on('save:miners', function (miners) {
    var file = __dirname + '\\config\\miners.json';

    fs.writeFile(file, JSON.stringify(miners, null, 4), function(err) {
      if(err) {
        console.log(err);
      } else {
        socket.emit('saved:miners', miners);
      }
    });
  });

  socket.on('config:save:pools', function (pools) {
    var file = __dirname + '\\config\\pools.json';

    fs.writeFile(file, JSON.stringify(pools, null, 4), function(err) {
      if(err) {
        console.log(err);
      } else {
        socket.emit('saved:pools', pools);
      }
    });
  });

  socket.on('gpu:enable', function (miner, device) {
    bfgminer.enableGpu(miner, device);
  });

  socket.on('gpu:disable', function (miner, device) {
    bfgminer.disableGpu(miner, device);
  });

  socket.on('disconnect', function () {
    console.log('I\'m disconnecting ' + socket.id);
    delete clients[socket.id];
  });

  socket.on('destroy:socket', function (socketId) {
    console.log('Destroying socket: ' + socketId);
    delete clients[socketId];
  });
}
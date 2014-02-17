var bfgminer = require('./modules/bfgminer'),
  fs = require('fs'),
  _ = require('lodash');

module.exports = function (socket) {
  var clients = {};
  console.log('A new socket connection has been spawned! ' + socket.id);

  clients[socket.id] = socket;
  socket.emit('socket:init', socket.id);

  var minerUpdateCallback = function (err, data, miner) {
    if (err) {
      socket.emit('error:miner', { miner:miner, error:err });
      return;
    }

    _.merge(miner, data);
    socket.emit('miner:config', miner);
  };

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
            bfgminer.init(miner, minerUpdateCallback, socket);
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

  socket.on('save:coins', function (coins) {
    var file = __dirname + '\\config\\coins.json';

    fs.writeFile(file, JSON.stringify(coins, null, 4), function (err) {
      if (err) {
        console.log(err);
      } else {
        socket.emit('saved:coins', coins);
      }
    });
  });

  socket.on('save:miners', function (miners) {
    var file = __dirname + '\\config\\miners.json';

    fs.writeFile(file, JSON.stringify(miners, null, 4), function (err) {
      if (err) {
        console.log(err);
      } else {
        socket.emit('saved:miners', miners);
      }
    });
  });

  socket.on('save:pools', function (pools) {
    var file = __dirname + '\\config\\pools.json';

    fs.writeFile(file, JSON.stringify(pools, null, 4), function (err) {
      if (err) {
        console.log(err);
      } else {
        socket.emit('saved:pools', pools);
      }
    });
  });

  socket.on('gpu:enable', function (data) {
    var miner = data.miner;
    var device = data.device;

    bfgminer.enableGpu(miner, device, function (err, data) {
      if (err || data.STATUS[0].STATUS == 'E') {
        socket.emit('error:gpuenable', data.STATUS[0]);
      }

      if (data.STATUS[0].STATUS == 'I') {
        socket.emit('success:gpuenable', data.STATUS[0]);
        bfgminer.update(miner, minerUpdateCallback);
      }
    });
  });

  socket.on('gpu:disable', function (data) {
    var miner = data.miner;
    var device = data.device;

    bfgminer.disableGpu(miner, device, function (err, data) {
      if (err || data.STATUS[0].STATUS == 'E') {
        socket.emit('error:gpudisable', data.STATUS[0]);
      }

      if (data.STATUS[0].STATUS == 'I') {
        socket.emit('success:gpudisable', data.STATUS[0]);
        bfgminer.update(miner, minerUpdateCallback);
      }
    });
  });

  socket.on('zero:miner', function (miner) {
    bfgminer.zeroMiner(miner, function (err, data) {
      if (err || data.STATUS[0].STATUS == 'E') {
        socket.emit('error:zerominer', { miner:miner, status:data.STATUS[0] });
      }

      if (data.STATUS[0].STATUS == 'S' || data.STATUS[0].STATUS == 'I') {
        socket.emit('success:zerominer', { miner:miner, status:data.STATUS[0] });
        bfgminer.update(miner, minerUpdateCallback);
      }
    });
  });

  socket.on('zero:allminers', function () {
    clients[socket.id].miners.forEach(function (miner) {
      bfgminer.zeroMiner(miner, function (err, data) {
        if (err || data.STATUS[0].STATUS == 'E') {
          socket.emit('error:zerominer', { miner:miner, status:data.STATUS[0] });
        }

        if (data.STATUS[0].STATUS == 'S' || data.STATUS[0].STATUS == 'I') {
          socket.emit('success:zerominer', { miner:miner, status:data.STATUS[0] });
          bfgminer.update(miner, minerUpdateCallback);
        }
      });
    });
  });

  socket.on('change:pool', function (data) {
    var miner = data.miner;
    var pool = data.pool;

    clients[socket.id].miners.forEach(function (m) {
      if (m.name === miner.name) {
        bfgminer.changePool(miner, pool, function (err, dataRes) {
          if (err) {
            socket.emit('error:changepool', { miner:miner, pool:pool, status:err});
          }

          if (dataRes.STATUS && dataRes.STATUS[0].STATUS == 'S') {
            socket.emit('success:changepool', { miner:miner, pool:pool, status:dataRes.STATUS[0] });
            bfgminer.update(miner, minerUpdateCallback);
          }
        });
      }
    });
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
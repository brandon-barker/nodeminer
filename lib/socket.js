var bfgminer  = require('./modules/bfgminer'),
    xgminer   = require('xgminer'),
    fs        = require('fs'),
    _         = require('lodash'),
    helpers   = require('./helpers');

module.exports = function (socket) {
  var clients = {};

  console.log('A new socket connection has been spawned! ' + socket.id);

  clients[socket.id] = socket;
  socket.emit('socket:init', socket.id);

  var minerUpdateCallback = function (err, data, miner) {
    if (err) {
      socket.emit('error:miner', { miner: miner, error: err });
      return;
    }

    _.merge(miner, data);
    socket.emit('miner:config', miner);
  };

  var updateMinerConfig = function (miner) {
    var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

    minerClient.summary().then(function (res) {
      _.merge(miner, helpers.parseSummary(miner, res));
      socket.emit('miner:config', miner);
    });

    minerClient.devs().then(function (res) {
      _.merge(miner, helpers.parseDevDetails(miner, res));
      socket.emit('miner:config', miner);
    });

    minerClient.pools().then(function (res) {
      _.merge(miner, helpers.parsePools(miner, res));
      socket.emit('miner:config', miner);
    });

    minerClient.devdetails().then(function (res) {
      _.merge(miner, helpers.parseDevDetails(miner, res));
      socket.emit('miner:config', miner);
    });
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

    var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

    minerClient.gpuenable(device.ID).then(function (res) {
      if (res.STATUS[0].STATUS == 'I') {
        socket.emit('success:gpuenable', res.STATUS[0]);

        updateMinerConfig(miner);
      }
    }, function (err) {
      if (err || err.STATUS[0].STATUS == 'E') {
        socket.emit('error:gpuenable', err.STATUS[0]);
      }
    });
  });

  socket.on('gpu:disable', function (data) {
    var miner = data.miner;
    var device = data.device;

    var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

    minerClient.gpudisable(device.ID).then(function (res) {
      if (res.STATUS[0].STATUS == 'I') {
        socket.emit('success:gpudisable', res.STATUS[0]);

        updateMinerConfig(miner);
      }
    }, function (err) {
      if (err || err.STATUS[0].STATUS == 'E') {
        socket.emit('error:gpuenable', err.STATUS[0]);
      }
    });
  });

  socket.on('update:intensity', function (data) {
    var miner = data.miner;
    var device = data.device;
    var value = data.value;

    var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

    minerClient.gpuintensity(device.ID + ',' + value).then(function (res) {
      if (res.STATUS[0].STATUS == 'S' || res.STATUS[0].STATUS == 'I') {
        socket.emit('success:intensity', device);

        updateMinerConfig(miner);
      }
    }, function (err) {
      socket.emit('error:intensity', err.STATUS[0]);
    });
  });

  socket.on('update:gpuengine', function (data) {
    var miner = data.miner;
    var device = data.device;
    var value = data.value;

    var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

    minerClient.gpuengine(device.ID + ',' + value).then(function (res) {
      if (res.STATUS[0].STATUS == 'S' || res.STATUS[0].STATUS == 'I') {
        socket.emit('success:gpuengine', device);

        updateMinerConfig(miner);
      }
    }, function (err) {
      if (data.STATUS[0].STATUS == 'E') {
        socket.emit('error:gpuengine', err.STATUS[0]);
      }
    });
  });

  socket.on('update:gpumemory', function (data) {
    var miner = data.miner;
    var device = data.device;
    var value = data.value;

    var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

    minerClient.gpumem(device.ID + ',' + value).then(function (res) {
      if (res.STATUS[0].STATUS == 'S' || res.STATUS[0].STATUS == 'I') {
        socket.emit('success:gpumemory', device);

        updateMinerConfig(miner);
      }
    }, function (err) {
      if (data.STATUS[0].STATUS == 'E') {
        socket.emit('error:gpumemory', err.STATUS[0]);
      }
    });
  });

  socket.on('update:gpuvoltage', function (data) {
    var miner = data.miner;
    var device = data.device;
    var value = data.value;

    var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

    minerClient.gpuvddc(device.ID + ',' + value).then(function (res) {
      if (res.STATUS[0].STATUS == 'S' || res.STATUS[0].STATUS == 'I') {
        socket.emit('success:gpuvoltage', device);

        updateMinerConfig(miner);
      }
    }, function (err) {
      if (data.STATUS[0].STATUS == 'E') {
        socket.emit('error:gpuvoltage', data.STATUS[0]);
      }
    });
  });

  socket.on('zero:miner', function (miner) {
    var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

    minerClient.zero('all,true').then(function (res) {
      socket.emit('success:zerominer', { miner: miner, status: res.STATUS[0] });
    }, function (err) {
      socket.emit('error:zerominer', { miner: miner, status: err.STATUS[0] });
    });
  });

  socket.on('zero:allminers', function () {
    clients[socket.id].miners.forEach(function (miner) {
      var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

      minerClient.zero('all,true').then(function (res) {
        socket.emit('success:zerominer', { miner: miner, status: res.STATUS[0] });
      }, function (err) {
        socket.emit('error:zerominer', { miner: miner, status: err.STATUS[0] });
      });
    });
  });

  socket.on('change:pool', function (data) {
    var miner = data.miner;
    var pool = data.pool;

    var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

    clients[socket.id].miners.forEach(function (m) {
      if (m.name === miner.name) {

        minerClient.pools().then(function (data) {
          if (data.POOLS && data.POOLS.length > 0) {
            var poolId = -1;

            data.POOLS.forEach(function (p) {
              if (p.URL == pool.url + ':' + pool.port) {
                poolId = p.POOL;

                minerClient.switchpool(poolId).then(function (res) {
                  socket.emit('success:changepool', { miner: miner, pool: pool, status: res.STATUS[0] });
                }, function (err) {
                  socket.emit('error:changepool', { miner: miner, pool: pool, status: err});
                });
              }
            });

            if (poolId == -1) {
              // Try add the pool to bf/c/sgminer
              minerClient.addpool(pool.url + ':' + pool.port + ',' + pool.workerName + ',' + pool.workerPassword).then(function (res) {
                if (res.STATUS && res.STATUS[0].STATUS == 'S') {
                  socket.emit('change:pool', data);
                }
              }, function (err) {
                socket.emit('error:changepool', { miner: miner, pool: pool, status: err});
              });
            }
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
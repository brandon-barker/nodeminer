/**
 * Dependencies
 */

var EventEmitter    = require('events').EventEmitter,
    util            = require('util'),
    xgminer         = require('xgminer'),
    fs              = require('fs'),
    path            = require('path'),
    _               = require('lodash'),
    helpers         = require('../helpers'),
    settingsService = new (require('./settingsService.js'))();

function minersService() {
  EventEmitter.call(this);
  var self = this;

  if (!self.miners || self.miners.length == 0) {
    self.load();
  }

  if (self.miners && self.miners.length > 0) {
    self.miners.forEach(function (miner) {
      self.poll(miner)
    });

    self.pollInterval = setInterval(function () {
      self.miners.forEach(function (miner) {
        self.poll(miner)
      });
    }, settingsService.settings['dashboard']['pollInterval'] || 5000);
  }
};

util.inherits(minersService, EventEmitter);

/**
 * Methods
 */

minersService.prototype.load = function () {
  var self = this;

  var file = path.normalize(__dirname + "/../config/miners.json");

  try {
    var data = fs.readFileSync(file, 'utf8');

    this.miners = JSON.parse(data);

  } catch (err) {
    setTimeout(function() {
      self.emit('fileError', { msg: 'Error reading miner configuration', data: err });
    }, 0);
  }
};

minersService.prototype.save = function (miners) {
  var self = this;

  var file = path.normalize(__dirname + "/../config/miners.json");

  fs.writeFile(file, JSON.stringify(miners, null, 4), function (err) {
    if (err) {
      setTimeout(function() {
        self.emit('fileError', { msg: 'Error saving miner configuration', data: err });
      }, 0);
      return;
    }

    setTimeout(function() {
      self.emit('saved', miners);
      self.miners = miners;
    }, 0);
  });
};

minersService.prototype.poll = function (miner) {
  var self = this;

  var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

  minerClient.summary().then(function (res) {
    _.merge(miner, helpers.parseSummary(miner, res));
    setTimeout(function() {
      self.emit('update', miner);
    }, 0);
  }, function (err) {
    setTimeout(function() {
      self.emit('error:miner', { miner:miner, error:err });
    }, 0);
  });

  minerClient.devs().then(function (res) {
    _.merge(miner, helpers.parseDevDetails(miner, res));

    setTimeout(function() {
      self.emit('update', miner);
    }, 0);
  }, function (err) {
    setTimeout(function() {
      self.emit('error:miner', { miner:miner, error:err });
    }, 0);
  });

  minerClient.pools().then(function (res) {
    //_.merge(miner, helpers.parsePools(miner, res));
    miner.pools = helpers.parsePools(miner, res);
    setTimeout(function() {
      self.emit('update', miner);
    }, 0);
  }, function (err) {
    setTimeout(function() {
      self.emit('error:miner', { miner:miner, error:err });
    }, 0);
  });

  minerClient.devdetails().then(function (res) {
    _.merge(miner, helpers.parseDevDetails(miner, res));

    setTimeout(function() {
      self.emit('update', miner);
    }, 0);
  }, function (err) {
    setTimeout(function() {
      self.emit('error:miner', { miner:miner, error:err });
    }, 0);
  });
};

minersService.prototype.enableGpu = function (miner, gpu) {
  var self = this;
  var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

  minerClient.gpuenable(gpu.ID).then(function (res) {
    if (res.STATUS[0].STATUS == 'I') {
      self.emit('success:gpuenable', res.STATUS[0]);
      self.poll(miner);
    }
  }, function (err) {
    if (err || err.STATUS[0].STATUS == 'E') {
      self.emit('error:gpuenable', err.STATUS[0]);
    }
  });
};

minersService.prototype.disableGpu = function (miner, gpu) {
  var self = this;
  var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

  minerClient.gpudisable(gpu.ID).then(function (res) {
    if (res.STATUS[0].STATUS == 'I') {
      self.emit('success:gpudisable', res.STATUS[0]);
      self.poll(miner);
    }
  }, function (err) {
    if (err || err.STATUS[0].STATUS == 'E') {
      self.emit('error:gpuenable', err.STATUS[0]);
    }
  });
};

minersService.prototype.updateIntensity = function (miner, device, value) {
  var self = this;
  var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

  minerClient.gpuintensity(device.ID + ',' + value).then(function (res) {
    if (res.STATUS[0].STATUS == 'S' || res.STATUS[0].STATUS == 'I') {
      self.emit('success:intensity', device);
      self.poll(miner);
    }
  }, function (err) {
    self.emit('error:intensity', err.STATUS[0]);
  });
};

minersService.prototype.updateGpuEngine = function (miner, device, value) {
  var self = this;
  var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

  minerClient.gpuengine(device.ID + ',' + value).then(function (res) {
    if (res.STATUS[0].STATUS == 'S' || res.STATUS[0].STATUS == 'I') {
      self.emit('success:gpuengine', device);
      self.poll(miner);
    }
  }, function (err) {
    if (data.STATUS[0].STATUS == 'E') {
      self.emit('error:gpuengine', err.STATUS[0]);
    }
  });
};

minersService.prototype.updateGpuMemory = function (miner, device, value) {
  var self = this;
  var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

  minerClient.gpumem(device.ID + ',' + value).then(function (res) {
    if (res.STATUS[0].STATUS == 'S' || res.STATUS[0].STATUS == 'I') {
      self.emit('success:gpumemory', device);
      self.poll(miner);
    }
  }, function (err) {
    if (data.STATUS[0].STATUS == 'E') {
      self.emit('error:gpumemory', err.STATUS[0]);
    }
  });
};

minersService.prototype.updateGpuVoltage = function (miner, device, value) {
  var self = this;
  var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

  minerClient.gpuvddc(device.ID + ',' + value).then(function (res) {
    if (res.STATUS[0].STATUS == 'S' || res.STATUS[0].STATUS == 'I') {
      self.emit('success:gpuvoltage', device);
      self.poll(miner);
    }
  }, function (err) {
    if (data.STATUS[0].STATUS == 'E') {
      self.emit('error:gpuvoltage', data.STATUS[0]);
    }
  });
};

minersService.prototype.zeroMiner = function (miner) {
  var self = this;
  var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

  minerClient.zero('all,true').then(function (res) {
    self.emit('success:zerominer', { miner: miner, status: res.STATUS[0] });
  }, function (err) {
    self.emit('error:zerominer', { miner: miner, status: err.STATUS[0] });
  });
};

minersService.prototype.changePool = function (miner, pool) {
  var self = this;
  var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

  self.miners.forEach(function (m) {
    if (m.name === miner.name) {

      minerClient.pools().then(function (data) {
        if (data.POOLS && data.POOLS.length > 0) {
          var poolId = -1;

          data.POOLS.forEach(function (p) {
            if (p.URL == pool.url + ':' + pool.port) {
              poolId = p.POOL;

              minerClient.switchpool(poolId).then(function (res) {
                self.emit('success:changepool', { miner: miner, pool: pool, status: res.STATUS[0] });
              }, function (err) {
                self.emit('error:changepool', { miner: miner, pool: pool, status: err});
              });
            }
          });

          if (poolId == -1) {
            // Try add the pool to bf/c/sgminer
            minerClient.addpool(pool.url + ':' + pool.port + ',' + pool.workerName + ',' + pool.workerPassword).then(function (res) {
              if (res.STATUS && res.STATUS[0].STATUS == 'S') {
                self.changePool(miner, pool);
              }
            }, function (err) {
              self.emit('error:changepool', { miner: miner, pool: pool, status: err});
            });
          }
        }
      });
    }
  });
};

minersService.prototype.ping = function (miner) {
  var minerClient = new xgminer(miner.host, miner.port, { miner: miner.miner });

  return minerClient.version();
};

module.exports = minersService;


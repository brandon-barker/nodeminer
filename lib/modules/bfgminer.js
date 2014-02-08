'use strict'

var net = require('net'),
  _ = require('lodash'),
  defaults = {
    connected: false
  };

module.exports = {
  config: {},

  defaults: {
    miner: 'bfgminer',
    host: 'brandonbarker.net',
    port: 4028,
    interval: 5000 // Update interval 5s
  },

  init: function (miner, callback, socket) {
    var self = this,
      callback = callback || {};

    self.config = _.extend({}, self.defaults, miner) || self.defaults;

    // Get initial config
    self.send('devdetails', '', function (err, data) {
      if (err) {
        return callback(err);
      }

      callback(null, self.parseDevDetails(data))
    });

    self.update(miner, callback);

    if (miner.intervalCount == 0) {
      miner.intervalCount++;
      setInterval(function () {
        if (!socket.disconnected) {
          self.update(miner, callback);
        }
      }, self.config.interval || self.defaults.interval)
    }
  },

  update: function (miner, callback) {
    var self = this,
      callback = callback || {};

    self.config = _.extend({}, self.defaults, miner) || self.defaults;

    self.send('summary', '', function (err, data) {
      if (err) {
        return callback(err);
      }

      callback(null, self.parseSummary(data))
    });

    self.send('devs', '', function (err, data) {
      if (err) {
        return callback(err);
      }

      callback(null, self.parseDevDetails(data))
    });

    self.send('pools', '', function (err, data) {
      if (err) {
        return callback(err);
      }

      callback(null, self.parsePools(data))
    });
  },

  enableGpu: function (miner, device, callback) {
    var self = this;

    self.config = _.extend({}, self.defaults, miner) || self.defaults;

    self.send('gpuenable', device.ID, function (err, data) {
      if (err) {
        callback(err);
      }

      callback(null, data);
    });
  },

  disableGpu: function (miner, device, callback) {
    var self = this;

    self.config = _.extend({}, self.defaults, miner) || self.defaults;

    self.send('gpudisable', device.ID, function (err, data) {
      if (err) {
        callback(err);
      }

      callback(null, data);
    });
  },

  send: function (command, parameter, callback) {
    var data = '',
      self = this,
      callback = callback || {},
      socket;

    //console.log('I\'ve made an API call! Command: ' + command + ' Parameter: ' + parameter);

    socket = net.connect({
      host: self.config.host || self.defaults.host,
      port: self.config.port || self.defaults.port
    }, function () {
      var json;

      socket.on('data', function (dataRes) {
        data += dataRes.toString();
      });

      socket.on('end', function () {
        socket.removeAllListeners();

        if (callback) {
          try {
            json = JSON.parse(data.replace('\x00', ''));
          } catch (e) {
            return callback(e);
          }

          callback(null, json);
        }
      });

      socket.on('error', function (err) {
        socket.removeAllListeners();
        console.log('Error occurred: ' + err);
      });

      socket.write(JSON.stringify({
        command: command,
        parameter: parameter
      }));
    });

    socket.on('error', function (err) {
      socket.removeAllListeners();
      callback(err);
      callback = null;
    });
  },

  parseDevDetails: function (response) {
    var data;

    if (response.DEVS && response.DEVS.length > 0) {
      data = _.extend({}, defaults, {
        devices: _.extend({}, response.DEVS)
      });
    }

    if (response.DEVDETAILS && response.DEVDETAILS.length > 0) {
      data = _.extend({}, defaults, {
        devices: _.extend({}, response.DEVDETAILS)
      });
    }

    return data;
  },

  parsePools: function (response) {
    var data;

    if (response.POOLS && response.POOLS.length > 0) {
      data = _.extend({}, defaults, response);
    }

    return data;
  },

  parseSummary: function (response) {
    var data;

    if (response.SUMMARY && response.SUMMARY.length > 0) {
      data = _.extend({}, defaults, response);
    }

    return data;
  }
};
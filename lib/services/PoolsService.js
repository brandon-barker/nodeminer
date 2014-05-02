/**
 * Dependencies
 */

var EventEmitter  = require('events').EventEmitter,
    util          = require('util'),
    fs            = require('fs'),
    path          = require('path'),
    _             = require('lodash'),
    helpers       = require('../helpers');

function poolsService() {
  EventEmitter.call(this);
  var self = this;

  if (!self.pools || self.pools.length == 0) {
    self.load();
  }
};

util.inherits(poolsService, EventEmitter);

poolsService.prototype.load = function () {
  var self = this;

  var file = path.normalize(__dirname + "/../config/pools.json");

  try {
    var data = fs.readFileSync(file, 'utf8');

    this.pools = JSON.parse(data);

  } catch (err) {
    setTimeout(function() {
      self.emit('fileError', { msg: 'Error reading pool configuration', data: err });
    }, 0);
  }
};

poolsService.prototype.save = function (pools) {
  var self = this;

  var file = path.normalize(__dirname + "/../config/pools.json");

  fs.writeFile(file, JSON.stringify(pools, null, 4), function (err) {
    if (err) {
      setTimeout(function() {
        self.emit('fileError', { msg: 'Error saving pool configuration', data: err });
      }, 0);
      return;
    }

    setTimeout(function() {
      self.emit('saved', pools);
      self.pools = pools;
    }, 0);
  });
};

module.exports = exports = new poolsService();


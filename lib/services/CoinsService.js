/**
 * Dependencies
 */

var EventEmitter  = require('events').EventEmitter,
    util          = require('util'),
    fs            = require('fs'),
    path          = require('path'),
    _             = require('lodash'),
    helpers       = require('../helpers');

function coinsService() {
  EventEmitter.call(this);
  var self = this;

  if (!self.coins || self.coins.length == 0) {
    self.load();
  }
};

util.inherits(coinsService, EventEmitter);

coinsService.prototype.load = function () {
  var self = this;

  var file = path.normalize(__dirname + "/../config/coins.json");

  try {
    var data = fs.readFileSync(file, 'utf8');

    this.coins = JSON.parse(data);

  } catch (err) {
    setTimeout(function() {
      self.emit('fileError', { msg: 'Error reading coin configuration', data: err });
    }, 0);
  }
};

coinsService.prototype.save = function (coins) {
  var self = this;

  var file = path.normalize(__dirname + "/../config/coins.json");

  fs.writeFile(file, JSON.stringify(coins, null, 4), function (err) {
    if (err) {
      setTimeout(function() {
        self.emit('fileError', { msg: 'Error saving coin configuration', data: err });
      }, 0);
      return;
    }

    setTimeout(function() {
      self.emit('saved', coins);
      self.coins = coins;
    }, 0);
  });
};

module.exports = exports = new coinsService();


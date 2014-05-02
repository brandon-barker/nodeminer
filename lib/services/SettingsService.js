/**
 * Dependencies
 */

var EventEmitter  = require('events').EventEmitter,
  util          = require('util'),
  fs            = require('fs'),
  path          = require('path'),
  _             = require('lodash'),
  helpers       = require('../helpers');

function settingsService() {
  EventEmitter.call(this);
  var self = this;

  if (_.isEmpty(self.settings)) {
    self.settings = self._defaults;
    self.load();
  }
};

util.inherits(settingsService, EventEmitter);

settingsService.prototype._defaults = {
  "dashboard": {
    "pollInterval": 5000,
    "collapseOverview": false,
    "collapseMiners": false,
    "autoExpandMiners": true
  },
  "monitoring": {
    "load": 99,
    "temperature": 82,
    "fan": 80,
    "hashrate": 650
  }
};

settingsService.prototype.load = function () {
  var self = this;

  var file = path.normalize(__dirname + "/../config/settings.json");

  try {
    var data = fs.readFileSync(file, 'utf8');

    self.settings = JSON.parse(data);
  } catch (err) {
    setTimeout(function() {
      self.emit('fileError', { msg: 'Error reading settings', data: err });
    }, 0);
  }
};

settingsService.prototype.save = function (settings) {
  var self = this;

  var file = path.normalize(__dirname + "/../config/settings.json");

  fs.writeFile(file, JSON.stringify(settings, null, 4), function (err) {
    if (err) {
      setTimeout(function() {
        self.emit('fileError', { msg: 'Error saving settings', data: err });
      }, 0);
      return;
    }

    setTimeout(function() {
      self.emit('saved', settings);
      self.settings = settings;
    }, 0);
  });
};

module.exports = exports = new settingsService();


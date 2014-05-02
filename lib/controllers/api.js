'use strict';

var MinerService = new (require('../services/minersService.js'))();

exports.ping = function (req, res) {
  var hostName = req.params.hostname;
  var port = req.params.port;

  MinerService.ping({ host: hostName, port: port}).then(function (data) {
    res.json({
      host: hostName,
      port: port,
      online: true,
      status: data
    });
  }, function (err) {
    res.json({
      host: hostName,
      port: port,
      online: false
    });
  });
};
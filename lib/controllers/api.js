var minerApi = require('../modules/bfgminer');

'use strict';

/**
 * Get awesome things
 */
exports.pingMiner = function (req, res) {
  var hostName = req.params.hostname;
  var port = req.params.port;

  minerApi.ping({ host: hostName, port: port }, function (err, data) {
    if (err) {
      res.json({
        host: hostName,
        port: port,
        online: false
      });
    } else {
      res.json({
        host: hostName,
        port: port,
        online: true,
        status: data
      });
    }
  });
};
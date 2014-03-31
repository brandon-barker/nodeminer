'use strict'

angular.module('nodeminerApp').factory('MinerSvc', function ($rootScope, $route, $http, socket) {
  var MinerSvc = {
    miners: [],

    initMiners: function (miners) {
      if (MinerSvc.miners.length == 0) {
        MinerSvc.miners = miners;

        $rootScope.$broadcast('init:miners');
      }
    },
    save: function (miners) {
      MinerSvc.miners = miners;
      socket.emit('save:miners', miners);
    },
    delete: function (miner) {
      _.remove(MinerSvc.miners, miner);

      MinerSvc.save(MinerSvc.miners);
    },
    ping: function (miner) {
      var promise = $http.get('/api/miner/ping/' + miner.host + '/' + miner.port).then(function (result) {
        return result.data;
      })

      return promise;
    }
  };

  socket.emit('init:miners', function () {
  });

  socket.on('miners:init', function (miners) {
    MinerSvc.initMiners(miners);
  });

  socket.on('saved:miners', function () {
    $rootScope.$broadcast('saved:miners');
  });

  return MinerSvc;
});
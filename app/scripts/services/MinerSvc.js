angular.module('nodeminerApp').factory('MinerSvc', function ($rootScope, socket) {
  var MinerSvc = {
    miners: [],

    initMiners: function (miners) {
      if (MinerSvc.miners.length == 0) {
        MinerSvc.miners = miners;

        $rootScope.$broadcast('init:miners', MinerSvc.miners);
      }
    }
  };

  socket.emit('init:miners', function () {
  });

  socket.on('miners:init', function (miners) {
    MinerSvc.initMiners(miners);
  });

  return MinerSvc;
});
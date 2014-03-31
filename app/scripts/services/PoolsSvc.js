'use strict'

angular.module('nodeminerApp').factory('PoolsSvc', function ($rootScope, $route, socket) {
  var PoolsSvc = {
    pools: [],

    init: function (pools) {
      if (PoolsSvc.pools.length == 0) {
        PoolsSvc.pools = pools;

        $rootScope.$broadcast('init:pools');
      }
    },
    changePool: function (miner, pool) {
      socket.emit('change:pool', { miner:miner, pool:pool });
    },
    save: function (pools) {
      PoolsSvc.pools = pools;
      socket.emit('save:pools', pools);
    },
    delete: function (pool) {
      _.remove(PoolsSvc.pools, pool);

      PoolsSvc.save(PoolsSvc.pools);
    }
  };


  socket.on('pools:init', function (pools) {
    PoolsSvc.init(pools);
  });

  socket.emit('init:pools', function () {
  });

  socket.on('saved:pools', function () {
    $rootScope.$broadcast('saved:pools');
  });

  socket.on('error:changepool', function (data) {
    $rootScope.$broadcast('error:changepool', data);
  });

  socket.on('success:changepool', function (data) {
    console.log(data);
    $rootScope.$broadcast('success:changepool', data);
  });

  return PoolsSvc;
});
'use strict'

angular.module('nodeminerApp').factory('PoolsSvc', function ($rootScope, $route, SocketIOSvc) {
  var PoolsSvc = {
    pools: [],

    init: function (pools) {
      PoolsSvc.pools = pools;
      $rootScope.$broadcast('init:pools');
    },
    changePool: function (miner, pool) {
      SocketIOSvc.emit('change:pool', { miner: miner, pool: pool });
    },
    save: function (pools) {
      PoolsSvc.pools = pools;
      SocketIOSvc.emit('save:pools', pools);
    },
    delete: function (pool) {
      _.remove(PoolsSvc.pools, pool);

      PoolsSvc.save(PoolsSvc.pools);
    }
  };


  SocketIOSvc.on('pools:init', function (pools) {
    PoolsSvc.init(pools);
  });

  SocketIOSvc.emit('init:pools', function () {
  });

  SocketIOSvc.on('saved:pools', function () {
    $rootScope.$broadcast('saved:pools');
  });

  SocketIOSvc.on('error:changepool', function (data) {
    $rootScope.$broadcast('error:changepool', data);
  });

  SocketIOSvc.on('success:changepool', function (data) {
    console.log(data);
    $rootScope.$broadcast('success:changepool', data);
  });

  return PoolsSvc;
});
'use strict'

angular.module('nodeminerApp').factory('CoinsSvc', function ($rootScope, $route, SocketIOSvc) {
  var CoinsSvc = {
    coins: [],

    init: function (coins) {
      CoinsSvc.coins = coins;
      $rootScope.$broadcast('init:coins');
    },
    save: function (coins) {
      CoinsSvc.coins = coins;
      SocketIOSvc.emit('save:coins', coins);
    },
    delete: function (coin) {
      _.remove(CoinsSvc.coins, coin);

      CoinsSvc.save(CoinsSvc.coins);
    }
  };

  SocketIOSvc.on('coins:init', function (coins) {
    CoinsSvc.init(coins);
  });

  SocketIOSvc.emit('init:coins', function () {
  });

  SocketIOSvc.on('saved:coins', function () {
    $rootScope.$broadcast('saved:coins');
  });

  return CoinsSvc;
});
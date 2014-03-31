'use strict'

angular.module('nodeminerApp').factory('CoinsSvc', function ($rootScope, $route, socket) {
  var CoinsSvc = {
    coins: [],

    init: function (coins) {
      if (CoinsSvc.coins.length == 0) {
        CoinsSvc.coins = coins;

        $rootScope.$broadcast('init:coins');
      }
    },
    save: function (coins) {
      CoinsSvc.coins = coins;
      socket.emit('save:coins', coins);
    },
    delete: function (coin) {
      _.remove(CoinsSvc.coins, coin);

      CoinsSvc.save(CoinsSvc.coins);
    }
  };

  socket.on('coins:init', function (coins) {
    CoinsSvc.init(coins);
  });

  socket.emit('init:coins', function () {
  });

  socket.on('saved:coins', function () {
    $rootScope.$broadcast('saved:coins');
  });

  return CoinsSvc;
});
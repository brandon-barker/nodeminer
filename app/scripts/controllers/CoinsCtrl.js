'use strict';

angular.module('nodeminerApp')
  .controller('CoinsCtrl', function ($scope, $route, CoinsSvc, PoolsSvc, MinerSvc, SocketIOSvc, SettingsSvc) {
    $scope.coin = {
      pools: []
    };
    $scope.coins = [];
    $scope.pools = [];

    $scope.init = function () {
      if ($scope.coins.length == 0) $scope.coins = CoinsSvc.coins;
      if ($scope.pools.length == 0) $scope.pools = PoolsSvc.pools;

      _.each($scope.coins, function (coin) {
        coin.showDetails = false;

        _.each(coin.pools, function (pool) {
          pool.showDetails = true;
        });
      });

      _.each($scope.pools, function (pool) {
        pool.showDetails = false;
      });
    };

    $scope.add = function (coin) {
      if ($scope.addCoinForm.$valid) {
        var _defaults = {
          "allowEdit": false,
          "showDetails": false
        };

        $scope.coins.push(_.merge(coin, _defaults));
        $scope.save($scope.coins);
      }
    };

    $scope.addPool = function (coin, pool) {
      if (coin) {
        if (!coin.pools) coin.pools = [];

        coin.pools.push(pool);
      } else {
        $scope.coin.pools.push(pool);
      }
    };

    $scope.deletePool = function (coin, pool) {
      if (coin) {
        _.remove(coin.pools, pool);
      } else {
        _.remove($scope.coin.pools, pool);
      }
    };

    $scope.toggleCoinDetails = function (coin) {
      coin.showDetails = !coin.showDetails;
    };

    $scope.togglePoolDetails = function (pool) {
      pool.showDetails = !pool.showDetails;
    };

    $scope.allowEdit = function (coin) {
      coin.allowEdit = true;
      coin.showDetails = true;
    };

    $scope.disableEdit = function (coin) {
      coin.allowEdit = false;

      SocketIOSvc.emit('reload', function () {
      });
    };

    $scope.saveEdit = function (coin) {
      coin.allowEdit = false;
      $scope.save($scope.coins);
    };

    $scope.save = function (coins) {
      CoinsSvc.save(coins);
    };

    $scope.delete = function (coin) {
      CoinsSvc.delete(coin);
    };

    $scope.$on('$destroy', function (event) {
      SocketIOSvc.removeAllListeners('init:coins');
    });

    $scope.$on('init:coins', function (coins) {
      $scope.coins = CoinsSvc.coins;
    });

    $scope.$on('init:pools', function (pools) {
      $scope.pools = PoolsSvc.pools;
    });

    $scope.$on('saved:coins', function () {
      $scope.coins = CoinsSvc.coins;
      toastr.success('Coin configuration saved!');

      // Reset our scope object
      $scope.coin = {
        pools: []
      };
    });

    $scope.init();
  });

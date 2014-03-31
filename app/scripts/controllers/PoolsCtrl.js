'use strict';

angular.module('nodeminerApp')
  .controller('PoolsCtrl', function ($scope, PoolsSvc, socket) {
    $scope.pools = []

    $scope.init = function () {
      if ($scope.pools.length == 0) $scope.pools = PoolsSvc.pools;

      _.each($scope.pools, function (pool) {
        pool.showDetails = false;
      });
    };

    $scope.add = function (pool) {
      if ($scope.addPoolForm.$valid) {
        var _defaults = {
          "allowEdit": false,
          "showDetails": false
        };

        $scope.pools.push(_.merge(pool, _defaults));
        $scope.save($scope.pools);
      }
    };

    $scope.togglePoolDetails = function (pool) {
      pool.showDetails = !pool.showDetails;
    };

    $scope.allowEdit = function (pool) {
      pool.allowEdit = true;
      pool.showDetails = true;
    };

    $scope.disableEdit = function (pool) {
      pool.allowEdit = false;
    };

    $scope.saveEdit = function (pool) {
      $scope.disableEdit(pool);
      $scope.save($scope.pools);
    };

    $scope.save = function (pools) {
      PoolsSvc.save(pools);
    };

    $scope.delete = function (pool) {
      PoolsSvc.delete(pool);
    };

    $scope.$on('$destroy', function (event) {
      socket.removeAllListeners('init:pools');
    });

    $scope.$on('init:pools', function (pools) {
      $scope.pools = PoolsSvc.pools;
    });

    $scope.$on('saved:pools', function () {
      $scope.pools = PoolsSvc.pools;
      toastr.success('Pool configuration saved!');

      // Reset our scope object
      $scope.pool = {};
    });

    $scope.init();
  });

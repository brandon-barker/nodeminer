'use strict';

angular.module('nodeminerApp')
  .controller('PoolsCtrl', function ($scope, socket) {
    $scope.pools = []

    $scope.togglePoolDetails = function (pool) {
      pool.showDetails = !pool.showDetails;
    }

    socket.on('pools:init', function (pools) {
      $scope.pools = pools;
    });

    socket.emit('init:pools', function () {
    });
  });

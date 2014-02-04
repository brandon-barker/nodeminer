'use strict';

angular.module('nodeminerApp')
  .controller('MinerCtrl', function ($scope, socket) {
    $scope.miners = []

    $scope.toggleMinerDetails = function (miner) {
      miner.showDetails = !miner.showDetails;
    }

    socket.on('miners:init', function (miners) {
      $scope.miners = miners;
    });

    socket.emit('init:miners', function () {
    });

    $scope.$on('$destroy', function (event) {
      socket.removeAllListeners('init:miners');
    });
  });
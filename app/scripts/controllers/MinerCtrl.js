'use strict';

angular.module('nodeminerApp')
  .controller('MinerCtrl', function ($scope, MinerSvc, socket) {
    $scope.miners = []

    $scope.toggleMinerDetails = function (miner) {
      miner.showDetails = !miner.showDetails;
    }

    $scope.$on('$destroy', function (event) {
      socket.removeAllListeners('init:miners');
    });

    $scope.$on('initMiners', function (miners) {
      $scope.miners = MinerSvc.miners;
    });

    if ($scope.miners.length == 0) $scope.miners = MinerSvc.miners;
  });
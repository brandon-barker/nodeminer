'use strict';

angular.module('nodeminerApp')
  .controller('MinerCtrl', function ($scope, MinerSvc, socket) {
    $scope.miners = [];

    $scope.toggleMinerDetails = function (miner) {
      miner.showDetails = !miner.showDetails;
    };

    $scope.add = function (miner) {
      var _defaults = {
        "devices": [],
        "pool": {},
        "notifications": {
          "count": 0,
          "list": []
        },
        "showDetails": false,
        "collapsed": false,
        "interval": 5000,
        "intervalCount": 0,
        "online": true
      };

      $scope.miners.push(_.merge(miner, _defaults));
      $scope.save($scope.miners);
    };

    $scope.allowEdit = function (miner) {
      miner.allowEdit = true;
      miner.showDetails = true;
    };

    $scope.disableEdit = function (miner) {
      miner.allowEdit = false;
    };

    $scope.saveEdit = function (miner) {
      $scope.disableEdit(miner);
      $scope.save($scope.miners);
    };

    $scope.save = function (miners) {
      MinerSvc.save(miners);
    };

    $scope.delete = function (miner) {
      MinerSvc.delete(miner);
    };

    $scope.$on('$destroy', function (event) {
      socket.removeAllListeners('init:miners');
    });

    $scope.$on('init:miners', function (miners) {
      $scope.miners = MinerSvc.miners;
    });

    $scope.$on('saved:miners', function () {
      $scope.miners = MinerSvc.miners;
      toastr.success('Miner configuration saved!');
    });

    if ($scope.miners.length == 0) $scope.miners = MinerSvc.miners;
  });
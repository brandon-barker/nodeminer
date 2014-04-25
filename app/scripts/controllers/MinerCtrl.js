'use strict';

angular.module('nodeminerApp')
  .controller('MinerCtrl', function ($scope, MinerSvc, CoinsSvc, PoolsSvc, SocketIOSvc) {
    $scope.miners = [];

    $scope.init = function () {
      if ($scope.miners.length == 0) $scope.miners = MinerSvc.miners;

      _.each($scope.miners, function (miner) {
        miner.showDetails = false;
      });
    };

    $scope.toggleMinerDetails = function (miner) {
      miner.showDetails = !miner.showDetails;
    };

    $scope.add = function (miner) {
      if ($scope.addMinerForm.$valid) {
        var _defaults = {
          "devices": [],
          "pool": {},
          "notifications": {
            "count": 0,
            "list": []
          },
          "showDetails": false,
          "allowEdit": false,
          "collapsed": false,
          "interval": 5000,
          "intervalCount": 0,
          "online": true
        };

        $scope.miners.push(_.merge(miner, _defaults));
        $scope.save($scope.miners);
      }
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

    $scope.testConnection = function (miner) {
      if ($scope.addMinerForm.$valid) {
        $('#test-connection').addClass('disabled');
        $('#test-connection').html('<i class="fa fa-spin fa-spinner"></i>&nbsp; Testing...');

        MinerSvc.ping(miner).then(function (d) {
          if (d.online) {
            $('#test-connection').removeClass('disabled');
            $('#test-connection').html('<i class="fa fa-check" style="color: green;"></i>&nbsp; Test Connection');
          } else {
            $('#test-connection').removeClass('disabled');
            $('#test-connection').html('<i class="fa fa-warning" style="color: red;"></i>&nbsp; Test Connection');
          }
        });
      }
    };

    $scope.$on('$destroy', function (event) {
      SocketIOSvc.removeAllListeners('init:miners');
    });

    $scope.$on('init:miners', function (miners) {
      $scope.miners = MinerSvc.miners;
    });

    $scope.$on('saved:miners', function () {
      $scope.miners = MinerSvc.miners;
      toastr.success('Miner configuration saved!');

      // Reset our scope object
      $scope.miner = {};
    });

    $scope.init();
  });
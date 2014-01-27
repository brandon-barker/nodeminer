'use strict';

angular.module('nodeminerApp')
  .controller('MinerCtrl', function ($scope, socket) {
    $scope.showSummary = true;

    $scope.miners = []

    $scope.toggleGpu = function (device) {
      if (device.Enabled == 'Y') {
        console.log('Disabling ' + device.Model + ' (' + device.ID + ')');
        socket.emit('gpu:disable', device);
      } else {
        console.log('Enabling ' + device.Model + ' (' + device.ID + ')');
        socket.emit('gpu:enable', device);
      }
    }

    $scope.calculateDashboardSummary = function () {
      return {
        miners: $scope.miners.length,
        devices: $scope.miners.devices.length
      }
    }

    $scope.toggleMinerDetails = function (miner) {
      miner.showDetails = !miner.showDetails;
    }

    $scope.toggleSummary = function () {
      $scope.showSummary = !$scope.showSummary;
    }

    socket.on('miners:init', function (miners) {
      $scope.miners = miners;
    });

    socket.on('miner:config', function (data) {
      if ($scope.miners && $scope.miners.length > 0) {
        $($scope.miners).each(function (index, miner) {
          if (miner.name == data.name) {
            $scope.miners[index].devices = data.devices;

            if (data.POOLS && data.POOLS.length > 0) {
              $scope.miners[index].pool = data.POOLS[0];
            }
          }
        });
      }
    });

    console.log($scope.miners);
    socket.emit('init:miners', function () {
    });
  });
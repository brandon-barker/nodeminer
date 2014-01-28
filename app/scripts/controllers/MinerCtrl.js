'use strict';

Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

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

    $scope.calculateDashboardOverview = function () {
      var overview = {
        miners: ($scope.miners && $scope.miners.length > 0) ? $scope.miners.length : 0,
        devices: 0,
        hashrate: 0
      };

      $($scope.miners).each(function (index, miner) {
        overview.devices += Object.size(miner.devices);

        $(miner.devices).each(function (i, devices) {
          for (var i = 0; i < Object.size(devices); i++) {
            overview.hashrate += devices[i]['MHS 5s'] * 1000;
          }
        })
      });

      return overview;
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

    socket.emit('init:miners', function () {
    });
  });
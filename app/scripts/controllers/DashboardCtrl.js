'use strict';

Object.size = function (obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

angular.module('nodeminerApp')
  .controller('DashboardCtrl', function ($scope, socket) {
    $scope.showSummary = true;

    $scope.miners = [];

    $scope.toggleGpu = function (device) {
      if (device.Enabled == 'Y') {
        console.log('Disabling ' + device.Model + ' (' + device.ID + ')');
        socket.emit('gpu:disable', device);
      } else {
        console.log('Enabling ' + device.Model + ' (' + device.ID + ')');
        socket.emit('gpu:enable', device);
      }
    }

    $scope.calculateMinerTotals = function () {
      $($scope.miners).each(function (index, miner) {
        miner.totalHashrate = 0;
        miner.totalAcceptedShares = 0;
        miner.totalRejectedShares = 0;
        miner.totalGpuActivity = 0;
        miner.totalTemperature = 0;
        miner.totalFanSpeed = 0;
        miner.totalWorkUtility = 0;
        miner.totalGpuEngine = 0;
        miner.totalMemoryClock = 0;
        miner.totalIntensity = 0;
        miner.totalVoltage = 0;
        miner.numberOfDevices = Object.size(miner.devices);

        $(miner.devices).each(function (i, devices) {
          for (var i = 0; i < Object.size(devices); i++) {
            miner.totalHashrate += devices[i]['MHS 5s'];
            miner.totalAcceptedShares += devices[i]['Accepted'];
            miner.totalRejectedShares += devices[i]['Rejected'];
            miner.totalGpuActivity += devices[i]['GPU Activity'];
            miner.totalTemperature += devices[i]['Temperature'];
            miner.totalFanSpeed += devices[i]['Fan Percent'];
            miner.totalWorkUtility += devices[i]['Work Utility'] || devices[i]['Utility'];
            miner.totalGpuEngine += devices[i]['GPU Clock'];
            miner.totalMemoryClock += devices[i]['Memory Clock'];
            miner.totalIntensity += parseInt(devices[i]['Intensity']);
            miner.totalVoltage += devices[i]['GPU Voltage'];
          }
        });

        miner.averageGpuActivity = (miner.totalGpuActivity / miner.numberOfDevices);
        miner.averageTemperature = (miner.totalTemperature / miner.numberOfDevices);
        miner.averageFanSpeed = (miner.totalFanSpeed / miner.numberOfDevices);
        miner.averageGpuEngine = (miner.totalGpuEngine / miner.numberOfDevices);
        miner.averageMemoryClock = (miner.totalMemoryClock / miner.numberOfDevices);
        miner.averageIntensity = (miner.totalIntensity / miner.numberOfDevices);
        miner.averageVoltage = (miner.totalVoltage / miner.numberOfDevices);
      });
    };

    $scope.calculateDashboardOverview = function () {
      $scope.overview = {
        miners: 0,
        hashrate: 0,
        averageHashrate: 0,
        totalAccepted: 0,
        totalRejected: 0,
        rejectRatio: 0,
        averageTemperature: 0,
        averageFanSpeed: 0,
        devices: 0,
        activeDevices: 0,
        healthyDevices: 0,
        sickDevices: 0
      };

      $scope.overview.miners = ($scope.miners && $scope.miners.length > 0) ? $scope.miners.length : 0;

      $($scope.miners).each(function (index, miner) {
        $scope.overview.devices += Object.size(miner.devices);

        $(miner.devices).each(function (i, devices) {
          for (var i = 0; i < Object.size(devices); i++) {
            $scope.overview.hashrate += devices[i]['MHS 5s'];
            $scope.overview.averageHashrate += devices[i]['MHS av'];
            $scope.overview.totalAccepted += devices[i]['Accepted'];
            $scope.overview.totalRejected += devices[i]['Rejected'];
            $scope.overview.averageTemperature += devices[i]['Temperature'];
            $scope.overview.averageFanSpeed += devices[i]['Fan Percent'];

            if (devices[i].Enabled == 'Y') $scope.overview.activeDevices += 1;
            if (devices[i].Status == 'Alive') $scope.overview.healthyDevices += 1;
            if (devices[i].Status == 'Sick' || devices[i].Status == 'Dead') $scope.overview.sickDevices += 1;
          }
        })
      });

      $scope.overview.rejectRatio = ($scope.overview.totalRejected / $scope.overview.totalAccepted * 100);
      $scope.overview.averageTemperature = ($scope.overview.averageTemperature / $scope.overview.devices);
      $scope.overview.averageFanSpeed = ($scope.overview.averageFanSpeed / $scope.overview.devices);
    }

    $scope.toggleSummary = function () {
      $scope.showSummary = !$scope.showSummary;
    }

    $scope.toggleMinerSummary = function (miner) {
      miner.collapsed = !miner.collapsed;
    }

    socket.on('connect', function () {
    });

    socket.on('disconnect', function (socket) {
    });

    socket.on('coins:init', function (coins) {
      $scope.coins = coins;
    });

    socket.on('miners:init', function (miners) {
      $scope.miners = miners;
    });

    socket.on('pools:init', function (pools) {
      $scope.pools = pools;
    });

    socket.on('socket:init', function (socketId) {
      $scope.socketId = socketId;
    });

    socket.on('miner:config', function (data) {
      if ($scope.miners && $scope.miners.length > 0) {
        $($scope.miners).each(function (index, miner) {
          if (miner.name == data.name) {
            $scope.miners[index].devices = data.devices;

            if (data.POOLS && data.POOLS.length > 0) {
              for (var i = 0; i < Object.size(data.POOLS); i++) {
                if (data.POOLS[i]['Stratum Active']) {
                  $scope.miners[index].pool = data.POOLS[i];
                }
              }
            }
          }
        });

        $scope.calculateDashboardOverview();
        $scope.calculateMinerTotals();
      }
    });

    socket.emit('init:miners', function () {
    });

    socket.emit('init:pools', function () {
    });

    socket.emit('init:coins', function () {
    });

    $scope.$on('$destroy', function (event) {
      socket.removeAllListeners('init:miners');
      socket.removeAllListeners('init:pools');
      socket.removeAllListeners('init:coins');
      //socket.emit('destroy:socket', $scope.socketId);
    });
  });
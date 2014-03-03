'use strict';

Object.size = function (obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

angular.module('nodeminerApp')
  .controller('DashboardCtrl', function ($scope, $rootScope, MinerSvc, CoinsSvc, PoolsSvc, socket) {
    $scope.showSummary = true;
    $scope.coins = [];
    $scope.miners = [];
    $scope.pools = [];

    $scope.toggleGpu = function (miner, device) {
      if (device.Enabled == 'Y') {
        console.log('Disabling ' + device.Model + ' (' + device.ID + ')');
        socket.emit('gpu:disable', { miner: miner, device: device });
      } else {
        console.log('Enabling ' + device.Model + ' (' + device.ID + ')');
        socket.emit('gpu:enable', { miner: miner, device: device });
      }
    }

    $scope.zeroMinerStats = function (miner) {
      socket.emit('zero:miner', miner);
    }

    $scope.zeroAllStats = function () {
      socket.emit('zero:allminers');
    }

    $scope.calculateMinerTotals = function () {
      $(MinerSvc.miners).each(function (index, miner) {
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
        estimatedRejectedHashrate: 0,
        averageTemperature: 0,
        averageFanSpeed: 0,
        devices: 0,
        activeDevices: 0,
        healthyDevices: 0,
        sickDevices: 0
      };

      $scope.overview.miners = (MinerSvc.miners && MinerSvc.miners.length > 0) ? MinerSvc.miners.length : 0;

      $(MinerSvc.miners).each(function (index, miner) {
        if (miner.online) {
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
        }
      });

      $scope.overview.rejectRatio = ($scope.overview.totalRejected / $scope.overview.totalAccepted * 100);
      $scope.overview.averageTemperature = ($scope.overview.averageTemperature / $scope.overview.devices);
      $scope.overview.averageFanSpeed = ($scope.overview.averageFanSpeed / $scope.overview.devices);
      $scope.overview.estimatedRejectedHashrate = ($scope.overview.averageHashrate - ($scope.overview.averageHashrate / (100 + $scope.overview.rejectRatio) * 100));

      document.title = 'nodeminer - ' + parseFloat($scope.overview.hashrate).toFixed(2) + ' Mh/s';
    }

    $scope.toggleSummary = function () {
      $scope.showSummary = !$scope.showSummary;
    }

    $scope.toggleMinerSummary = function (miner) {
      miner.collapsed = !miner.collapsed;
    }

    $scope.changePool = function (miner, pool) {
      PoolsSvc.changePool(miner, pool);
    };

    $scope.updateIntensity = function (miner, device, value) {
      socket.emit('update:intensity', { miner:miner, device:device, value:value });
    };

    $scope.updateGpuEngine = function (miner, device, value) {
      socket.emit('update:gpuengine', { miner:miner, device:device, value:value });
    };

    $scope.updateMemoryClock = function (miner, device, value) {
      socket.emit('update:gpumemory', { miner:miner, device:device, value:value });
    };

    $scope.updateGpuVoltage = function (miner, device, value) {
      socket.emit('update:gpuvoltage', { miner:miner, device:device, value:value });
    };

    socket.on('socket:init', function (socketId) {
      $scope.socketId = socketId;
    });

    socket.on('miner:config', function (data) {
      if (MinerSvc.miners && MinerSvc.miners.length > 0 && data) {
        $(MinerSvc.miners).each(function (index, miner) {
          if (miner.name == data.name) {
            MinerSvc.miners[index].online = true;
            MinerSvc.miners[index].devices = data.devices;

            if (data.POOLS && data.POOLS.length > 0) {
              for (var i = 0; i < Object.size(data.POOLS); i++) {
                if (data.POOLS[i]['Stratum Active']) {
                  MinerSvc.miners[index].pool = data.POOLS[i];
                }
              }
            }
          }
        });

        $scope.calculateDashboardOverview();
        $scope.calculateMinerTotals();
      }
    });

    socket.on('error:miner', function (err) {
      var miner = err.miner;
      var error = err.error;

      if (miner) {
        if (error.code == 'ETIMEDOUT' || error.code == 'ECONNREFUSED') {
          MinerSvc.miners.forEach(function (m) {
            if (m.name == miner.name) {
              m.online = false;
            }
          });
        } else {
          toastr.error('An error occurred on ' + miner.name + '!');
          console.log(error);
        }
      }
    });

    socket.on('error:gpuenable', function (status) {
      toastr.error('Error enabling GPU: ' + status.Msg);
    });

    socket.on('error:gpudisable', function (status) {
      toastr.error('Error disabling GPU: ' + status.Msg);
    });

    socket.on('error:zerominer', function (data) {
      var miner = data.miner;
      var status = data.status;

      toastr.error('Error zeroing "' + miner.name + '" stats: ' + status.Msg);
    });

    socket.on('error:intensity', function (data) {
      var device = data.device;

      toastr.error('Error updating GPU Intensity on "' + device.Model + '"');
    });

    socket.on('error:gpuengine', function (data) {
      var device = data.device;

      toastr.error('Error updating GPU Engine on "' + device.Model + '"');
    });

    socket.on('error:gpumemory', function (data) {
      var device = data.device;

      toastr.error('Error updating Memory Clock on "' + device.Model + '"');
    });

    socket.on('error:gpuvoltage', function (data) {
      var device = data.device;

      toastr.error('Error updating GPU Voltage on "' + device.Model + '"');
    });

    socket.on('success:intensity', function (device) {
      toastr.success('Successfully updated GPU Intensity on "' + device.Model + '"');
    });

    socket.on('success:gpuengine', function (device) {
      toastr.success('Successfully updated GPU Engine on "' + device.Model + '"');
    });

    socket.on('success:gpumemory', function (device) {
      toastr.success('Successfully updated Memory Clock on "' + device.Model + '"');
    });

    socket.on('success:gpuvoltage', function (device) {
      toastr.success('Successfully updated GPU Voltage on "' + device.Model + '"');
    });

    socket.on('success:gpuenable', function () {
      toastr.success('Successfully enabled GPU.');
    });

    socket.on('success:gpudisable', function () {
      toastr.success('Successfully disabled GPU.');
    });

    socket.on('success:zerominer', function (data) {
      var miner = data.miner;

      toastr.success('Successfully zeroed "' + miner.name + '" statistics.');
    });

    $scope.$on('$destroy', function (event) {
      socket.removeAllListeners('init:miners');
      socket.removeAllListeners('init:pools');
      socket.removeAllListeners('init:coins');
      //socket.emit('destroy:socket', $scope.socketId);
    });

    $scope.$on('init:miners', function () {
      $scope.miners = MinerSvc.miners;
    });

    $scope.$on('init:coins', function () {
      $scope.coins = CoinsSvc.coins;
    });

    $scope.$on('init:pools', function () {
      $scope.pools = PoolsSvc.pools;
    });

    $scope.$on('error:changepool', function (event, data) {
      var miner = data.miner;
      var pool = data.pool;
      var status = data.status;

      console.log(status);
      toastr.error('Error switching pool to "' + pool.url + '": ' + status);
    });

    $scope.$on('success:changepool', function (event, data) {
      var miner = data.miner;
      var pool = data.pool;

      toastr.success('Successfully switched pool to "' + pool.name + '" on "' + miner.name + '"');
    });

    if ($scope.miners.length == 0) {
      $scope.miners = MinerSvc.miners;
      $scope.calculateDashboardOverview();
      $scope.calculateMinerTotals();
    }

    if ($scope.coins.length == 0) {
      $scope.coins = CoinsSvc.coins;
    }

    if ($scope.pools.length == 0) {
      $scope.pools = PoolsSvc.pools;
    }
  });
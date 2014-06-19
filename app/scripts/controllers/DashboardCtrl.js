'use strict';

Object.size = function (obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

angular.module('nodeminerApp')
  .controller('DashboardCtrl', function ($scope, $rootScope, MinerSvc, CoinsSvc, PoolsSvc, SocketIOSvc, SettingsSvc) {
    $scope.showSummary = true;
    $scope.userOverrideCollapse = false;
    $scope.coins = [];
    $scope.miners = [];
    $scope.pools = [];

    $scope.toggleGpu = function (miner, device) {
      if (device.Enabled == 'Y') {
        SocketIOSvc.emit('gpu:disable', { miner: miner, device: device });
      } else {
        SocketIOSvc.emit('gpu:enable', { miner: miner, device: device });
      }
    }

    $scope.zeroMinerStats = function (miner) {
      SocketIOSvc.emit('zero:miner', miner);
    }

    $scope.zeroAllStats = function () {
      SocketIOSvc.emit('zero:allminers');
    }

    $scope.calculateMinerTotals = function () {
      $(MinerSvc.miners).each(function (index, miner) {
        miner.stats = {
          totalHashrate: 0,
          totalAcceptedShares: 0,
          totalRejectedShares: 0,
          totalGpuActivity: 0,
          totalTemperature: 0,
          totalFanSpeed: 0,
          totalWorkUtility: 0,
          totalGpuEngine: 0,
          totalMemoryClock: 0,
          totalIntensity: 0,
          totalVoltage: 0,
          numberOfDevices: Object.size(miner.devices)
        };

        $(miner.devices).each(function (i, devices) {
          for (var i = 0; i < Object.size(devices); i++) {
            miner.stats.totalHashrate += devices[i]['MHS 5s'];
            miner.stats.totalAcceptedShares += devices[i]['Accepted'];
            miner.stats.totalRejectedShares += devices[i]['Rejected'];
            miner.stats.totalGpuActivity += devices[i]['GPU Activity'];
            miner.stats.totalTemperature += devices[i]['Temperature'];
            miner.stats.totalFanSpeed += devices[i]['Fan Percent'];
            miner.stats.totalWorkUtility += devices[i]['Work Utility'] || devices[i]['Utility'];
            miner.stats.totalGpuEngine += devices[i]['GPU Clock'];
            miner.stats.totalMemoryClock += devices[i]['Memory Clock'];
            miner.stats.totalIntensity += parseInt(devices[i]['Intensity']);
            miner.stats.totalVoltage += devices[i]['GPU Voltage'];
          }
        });

        miner.stats.averageGpuActivity = (miner.stats.totalGpuActivity / miner.stats.numberOfDevices);
        miner.stats.averageTemperature = (miner.stats.totalTemperature / miner.stats.numberOfDevices);
        miner.stats.averageFanSpeed = (miner.stats.totalFanSpeed / miner.stats.numberOfDevices);
        miner.stats.averageGpuEngine = (miner.stats.totalGpuEngine / miner.stats.numberOfDevices);
        miner.stats.averageMemoryClock = (miner.stats.totalMemoryClock / miner.stats.numberOfDevices);
        miner.stats.averageIntensity = (miner.stats.totalIntensity / miner.stats.numberOfDevices);
        miner.stats.averageVoltage = (miner.stats.totalVoltage / miner.stats.numberOfDevices);
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
      $scope.userOverrideCollapse = true;
    }

    $scope.changePool = function (miner, pool) {
      if (miner === 'global') {
        $(MinerSvc.miners).each(function (i, m) {
          PoolsSvc.changePool(m, pool);
        });
        return;
      }

      PoolsSvc.changePool(miner, pool);
    };

    $scope.updateIntensity = function (miner, device, value) {
      SocketIOSvc.emit('update:intensity', { miner: miner, device: device, value: value });
    };

    $scope.updateGpuEngine = function (miner, device, value) {
      SocketIOSvc.emit('update:gpuengine', { miner: miner, device: device, value: value });
    };

    $scope.updateMemoryClock = function (miner, device, value) {
      SocketIOSvc.emit('update:gpumemory', { miner: miner, device: device, value: value });
    };

    $scope.updateGpuVoltage = function (miner, device, value) {
      SocketIOSvc.emit('update:gpuvoltage', { miner: miner, device: device, value: value });
    };

    /**
     * Dashboard Monitoring
     */

    $scope.hasError = function (device, miner, monitor) {
      var hasError = false;

      $(MinerSvc.miners).each(function (i, m) {
        if (miner.name == m.name) {
          if (!_.isEmpty(SettingsSvc.settings)) {
            switch (monitor) {
              case 'load':
                hasError = device['GPU Activity'] < SettingsSvc.settings['monitoring']['load'];
                if (hasError) {
                  miner.hasError = true;
                  $scope.showWebNotification('GPU Activity has fallen below the threshold on GPU ' + device.ID + ' (' + miner.name + ')');
                }
                break;
              case 'temperature':
                hasError = device['Temperature'] > SettingsSvc.settings['monitoring']['temperature'];
                if (hasError) {
                  miner.hasError = true;
                  $scope.showWebNotification('Temperature has exceeded the threshold on GPU ' + device.ID + ' (' + miner.name + ')');
                }
                break;
              case 'fan':
                hasError = device['Fan Percent'] < SettingsSvc.settings['monitoring']['fan'];
                if (hasError) {
                  miner.hasError = true;
                  $scope.showWebNotification('GPU Fan has fallen below the threshold on GPU ' + device.ID + ' (' + miner.name + ')');
                }
                break;
              case 'hashrate':
                hasError = device['MHS 5s'] * 1000 < SettingsSvc.settings['monitoring']['hashrate'];
                if (hasError) {
                  miner.hasError = true;
                  $scope.showWebNotification('Hashrate has fallen below the threshold on GPU ' + device.ID + ' (' + miner.name + ')');
                }
                break;
            }

            if (!miner.hasError && SettingsSvc.settings['dashboard']['collapseMiners'] && !$scope.userOverrideCollapse) {
              miner.collapsed = true;
            }

            if (hasError && SettingsSvc.settings['dashboard']['autoExpandMiners'] && !$scope.userOverrideCollapse) {
              miner.collapsed = false;
            }
          }
        }
      });

      return hasError;
    };

    $scope.showWebNotification = function (message) {
      if (SettingsSvc.settings.notifications.enabled && !Notify.needsPermission()) {
        var notification = new Notify('nodeminer', {
          body: message,
          tag: message,
          icon: '/images/yeoman.png'
        });

        //notification.show();
      }
    };

    SocketIOSvc.on('socket:init', function (socketId) {
      $scope.socketId = socketId;
    });

    SocketIOSvc.on('miner:config', function (data) {
      if (MinerSvc.miners && MinerSvc.miners.length > 0 && data) {
        $(MinerSvc.miners).each(function (index, miner) {
          if (miner.name == data.name) {
            MinerSvc.miners[index].online = true;
            MinerSvc.miners[index].devices = data.devices;

            if (data.pools && data.pools.length > 0) {
              for (var i = 0; i < Object.size(data.pools); i++) {
                if (data.pools[i].Active) {
                  MinerSvc.miners[index].pool = data.pools[i];
                  return;
                }
              }
            }
          }
        });

        $scope.calculateDashboardOverview();
        $scope.calculateMinerTotals();
      }
    });

    SocketIOSvc.on('error:miner', function (err) {
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

    SocketIOSvc.on('error:gpuenable', function (status) {
      toastr.error('Error enabling GPU: ' + status.Msg);
    });

    SocketIOSvc.on('error:gpudisable', function (status) {
      toastr.error('Error disabling GPU: ' + status.Msg);
    });

    SocketIOSvc.on('error:zerominer', function (data) {
      var miner = data.miner;
      var status = data.status;

      toastr.error('Error zeroing "' + miner.name + '" stats: ' + status.Msg);
    });

    SocketIOSvc.on('error:intensity', function (data) {
      var device = data.device;

      toastr.error('Error updating GPU Intensity on "' + device.Model + '"');
    });

    SocketIOSvc.on('error:gpuengine', function (data) {
      var device = data.device;

      toastr.error('Error updating GPU Engine on "' + device.Model + '"');
    });

    SocketIOSvc.on('error:gpumemory', function (data) {
      var device = data.device;

      toastr.error('Error updating Memory Clock on "' + device.Model + '"');
    });

    SocketIOSvc.on('error:gpuvoltage', function (data) {
      var device = data.device;

      toastr.error('Error updating GPU Voltage on "' + device.Model + '"');
    });

    SocketIOSvc.on('success:intensity', function (device) {
      toastr.success('Successfully updated GPU Intensity on "' + device.Model + '"');
    });

    SocketIOSvc.on('success:gpuengine', function (device) {
      toastr.success('Successfully updated GPU Engine on "' + device.Model + '"');
    });

    SocketIOSvc.on('success:gpumemory', function (device) {
      toastr.success('Successfully updated Memory Clock on "' + device.Model + '"');
    });

    SocketIOSvc.on('success:gpuvoltage', function (device) {
      toastr.success('Successfully updated GPU Voltage on "' + device.Model + '"');
    });

    SocketIOSvc.on('success:gpuenable', function () {
      toastr.success('Successfully enabled GPU.');
    });

    SocketIOSvc.on('success:gpudisable', function () {
      toastr.success('Successfully disabled GPU.');
    });

    SocketIOSvc.on('success:zerominer', function (data) {
      var miner = data.miner;

      toastr.success('Successfully zeroed "' + miner.name + '" statistics.');
    });

    $scope.$on('$destroy', function (event) {
      SocketIOSvc.removeAllListeners('init:miners');
      SocketIOSvc.removeAllListeners('init:pools');
      SocketIOSvc.removeAllListeners('init:coins');
      //SocketIOSvc.emit('destroy:SocketIOSvc', $scope.SocketIOSvcId);
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

    $scope.$on('init:settings', function () {
      if (SettingsSvc.settings['dashboard']['collapseOverview']) {
        $scope.showSummary = false;
      }

      if (SettingsSvc.settings['dashboard']['collapseMiners']) {
        $(MinerSvc.miners).each(function (index, miner) {
          miner.collapsed = true;
        });
      }
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
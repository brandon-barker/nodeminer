'use strict';

angular.module('nodeminerApp')
  .controller('SettingsCtrl', function ($scope, PoolsSvc, CoinsSvc, MinerSvc, SettingsSvc, SocketIOSvc) {
    $scope.settings = {};

    $scope.init = function () {
      if (_.isEmpty($scope.settings)) $scope.settings = SettingsSvc.settings;
    };

    $scope.saveSettings = function () {
      $scope.save($scope.settings);
    };

    $scope.save = function (settings) {
      SettingsSvc.save(settings);
    };

    $scope.$on('$destroy', function (event) {
      SocketIOSvc.removeAllListeners('init:settings');
    });

    $scope.$on('init:settings', function () {
      $scope.settings = SettingsSvc.settings;
    });

    $scope.$on('saved:settings', function () {
      $scope.settings = SettingsSvc.settings;
      toastr.success('Settings successfully saved!');
    });

    $scope.init();
  });

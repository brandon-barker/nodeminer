'use strict'

angular.module('nodeminerApp').factory('SettingsSvc', function ($rootScope, $route, SocketIOSvc) {
  var SettingsSvc = {
    settings: {},

    init: function (settings) {
      if (!_.isEmpty(settings)) {
        SettingsSvc.settings = settings;

        $rootScope.$broadcast('init:settings');
      }
    },

    save: function (settings) {
      SettingsSvc.settings = settings;
      SocketIOSvc.emit('save:settings', settings);
    }
  };

  SocketIOSvc.on('settings:init', function (settings) {
    SettingsSvc.init(settings);
  });

  SocketIOSvc.emit('init:settings', function () {
  });

  SocketIOSvc.on('saved:settings', function () {
    $rootScope.$broadcast('saved:settings');
  });

  return SettingsSvc;
});
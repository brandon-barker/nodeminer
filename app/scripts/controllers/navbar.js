'use strict';

angular.module('nodeminerApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    $scope.menu = [
      {
        'title': 'Dashboard',
        'link': '/',
        'fa-icon': 'fa fa-camera-retro'
      },
      {
        'title': 'Coin Configuration',
        'link': '/coins'
      },
      {
        'title': 'Settings',
        'link': '/settings'
      },
      {
        'title': 'Donate',
        'link': '/donate'
      }
    ]
    
    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });

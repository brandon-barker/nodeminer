'use strict';

angular.module('nodeminerApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
  ])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/miners', {
        templateUrl: 'partials/miners'
      })
      .when('/settings', {
        templateUrl: 'partials/settings'
      })
      .when('/coins', {
        templateUrl: 'partials/coins'
      })
      .when('/pools', {
        templateUrl: 'partials/pools'
      })
      .when('/', {
        templateUrl: 'partials/main'
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  });
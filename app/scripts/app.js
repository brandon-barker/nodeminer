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
                templateUrl: 'partials/settings',
                controller: 'MainCtrl'
            })
            .when('/settings', {
                templateUrl: 'partials/settings',
                controller: 'MainCtrl'
            })
            .when('/coins', {
                templateUrl: 'partials/coins',
                controller: 'MainCtrl'
            })
            .when('/pools', {
                templateUrl: 'partials/coins',
                controller: 'MainCtrl'
            })
            .when('/', {
                templateUrl: 'partials/main',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode(true);
    });
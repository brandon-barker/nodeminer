'use strict';

angular.module('nodeminerApp')
    .controller('NavbarCtrl', function ($scope, $location) {
        $scope.menu = [
            {
                'title': 'Dashboard',
                'link': '/',
                'icon': 'fa fa-dashboard'
            },
            {
                'title': 'Miners',
                'link': '/miners',
                'icon': 'fa fa-gavel'
            },
            {
                'title': 'Coins',
                'link': '/coins',
                'icon': 'fa fa-btc'
            },
            {
                'title': 'Pools',
                'link': '/pools',
                'icon': 'fa fa-cloud'
            },
            {
                'title': 'Settings',
                'link': '/settings',
                'icon': 'fa fa-gear'
            }
        ]

        $scope.isActive = function (route) {
            return route === $location.path();
        };
    });

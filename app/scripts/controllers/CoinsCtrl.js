'use strict';

angular.module('nodeminerApp')
  .controller('CoinsCtrl', function ($scope, socket) {
    $scope.coins = []

    $scope.toggleCoinDetails = function (coin) {
      coin.showDetails = !coin.showDetails;
    }

    socket.on('coins:init', function (coins) {
      $scope.coins = coins;
    });

    socket.emit('init:coins', function () {
    });

    $scope.$on('$destroy', function (event) {
      socket.removeAllListeners('init:coins');
    });
  });

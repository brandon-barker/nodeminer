'use strict';

angular.module('nodeminerApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'xeditable'
  ])
  .run(function (editableOptions) {
    editableOptions.theme = 'bs3';
  })
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
  })
  .directive('ngPopoverConfirm', function () {
    return {
      restirct: 'A',
      link: function (scope, element, attrs) {
        console.log(attrs);
        element.popover({
          html: attrs['html'] || true,
          placement: attrs['placement'] || 'right',
          trigger: attrs['trigger'] || 'manual',
          content: attrs['content'] || "<span data-popover-confirm-container> \
          <span class='btn btn-success btn-sm popover-confirm-btn'> \
            <i class='fa fa-check fa-fw'></i>&nbsp; Yes \
          </span> \
          <span class='btn btn-danger btn-sm popover-cancel-btn'> \
            <i class='fa fa-times fa-fw'></i>&nbsp; No \
          </span> \
        </span>"
        });

        $(document).off('click', '[ng-popover-confirm]');
        $(document).on('click', '[ng-popover-confirm]', function () {
          var btn = $(this),
            popover = btn.next();

          btn.popover('toggle');
        });

        $(document).off('click', '.popover-confirm-btn');
        $(document).on('click', '.popover-confirm-btn', function () {
          var popover = $(this).closest('.popover'),
            btn = popover.prev(),
            callback = btn.attr('ng-popover-confirm'),
            result = eval('scope.' + callback);

          btn.popover('hide');
        });

        $(document).off('click', '.popover-cancel-btn');
        $(document).on('click', '.popover-cancel-btn', function () {
          var popover = $(this).closest('.popover'),
            btn = popover.prev();

          btn.popover('hide');
        });
      }
    }
  });
'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('DashboardCtrl', function ($scope, $state, Meter, Auth  ) {
    // Center map.
    $scope.center = {
      lat: 31.6045263709886,
      lng: 34.77267265319824,
      zoom: 16
    };

    // If the user is not authenticated, goto login state.
    if (!Auth.isAuthenticated()) {
      $state.go('login');
    }

    $scope.$on('$stateChangeSuccess', function(event, toState){
      //Meter Principal dashboard view.
      if (toState.name === 'dashboard.main') {
        // Load meters.
        Meter.get();
      }
    });

  });

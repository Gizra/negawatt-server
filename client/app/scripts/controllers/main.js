'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('MainCtrl', function ($scope, $state, Auth, NegawattConfig) {
    $scope.config = NegawattConfig;

    // Center map.
    $scope.center = {
      lat: 31.607998592155507,
      lng: 34.763360023498535,
      zoom: 16
    };

    // If the user it's not authenticated, goto login state.
    if (!Auth.isAuthenticated()) {
      $state.go('login');
    }
  });

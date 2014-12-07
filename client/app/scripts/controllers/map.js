'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('MapCtrl', function ($scope, $state, Meter) {

    // Update markers when the Meters data updated.
    $scope.$on('negawatt.meters.changed', function() {
      // Load meters.
      Meter.get().then(function(meters) {
        $scope.meters = meters;
      });
    });

  });

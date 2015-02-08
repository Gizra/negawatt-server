'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:UsageCtrl
 * @description
 * # UsageCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('UsageCtrl', function ($scope, $state, $stateParams, usage, meters, ChartUsage) {
    $scope.usageChart = usage;

    // Detail information of the selected marker.
    if (angular.isDefined($stateParams.markerId)) {
      // Share meter selected.
      $scope.meterSelected = meters[$stateParams.markerId];

      // Chart usage information of the selected marker.
      ChartUsage.meterSelected(meters[$stateParams.markerId]);
    }

    // Handle lazy-load of electricity data.
    // When cache expands, update the chart.
    $scope.$on("nwElectricityChanged", function(event, filters, stateName) {
      ChartUsage.getByFilters($stateParams.chartFreq, filters, stateName).then(function(data) {
        // Update usageChart only if we're in the proper state.
        if ($state.current.name == stateName) {
          $scope.usageChart = data;
        }
      });
    });

  });

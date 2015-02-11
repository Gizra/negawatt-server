'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:UsageCtrl
 * @description
 * # UsageCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('UsageCtrl', function ($scope, $stateParams, usage, meters, ChartUsage) {
    // Get data from the cache, since 'usage' might not be up to date
    // after lazy-load.
    ChartUsage.get($stateParams).then(function(data) {
      $scope.usageChart = data;
    });

    // Detail information of the selected marker.
    if (angular.isDefined($stateParams.markerId)) {
      // Share meter selected.
      $scope.meterSelected = meters[$stateParams.markerId];

      // Chart usage information of the selected marker.
      ChartUsage.meterSelected(meters[$stateParams.markerId]);
    }

    // Handle lazy-load of electricity data.
    // When cache expands, update the chart.
    $scope.$on("nwElectricityChanged", function(event, filtersHash) {

      // Don't update usageChart if we're not in the active request.
      if (filtersHash != ChartUsage.getActiveRequestHash()) {
        return;
      }

      ChartUsage.getByFiltersHash(filtersHash).then(function(data) {
        $scope.usageChart = data;
      });
    });

  });

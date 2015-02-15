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

    // Increase chart size.
    if (true) {
      var newHeight = 300;

      // Calculations.
      var newWidth = newHeight * 510 / 220;
      var newBottom = newHeight + 15;

      var element = angular.element('#messages-view');
      element.css('bottom', newBottom + 'px');

      element = angular.element('#details-view');
      element.css('bottom', newBottom + 'px');
      var detailsHeight = +element.css('height').replace('px', '');

      element = angular.element('#catigories-view');
      element.css('bottom', newBottom + detailsHeight + 5 + 'px');

      element = angular.element('#usage-view');
      element.css('height', newHeight + 'px');
      element.css('width', newWidth + 'px');
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

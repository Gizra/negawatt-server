'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:UsageCtrl
 * @description
 * # UsageCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('UsageCtrl', function ($scope, $q, $location, $state, $stateParams, $urlRouter, ChartUsage, UsagePeriod, Chart, account, usage, meters) {
    var vm = this;

    /**
     * Return
     */
    vm.hasData = function hasData() {
      return false;
    }

    var chartUpdated;
    // The initialization in a empty object is need it to avoid an error in the initial rendering. (Chart kws usage data)
    $scope.usageChartData = {};


    // Get the parameters chart frecuency.
    if (angular.isDefined($stateParams.chartFreq)) {
      Chart.setActiveFrequency($stateParams.chartFreq);
    }


    // Get from parameters information of the selected marker.
    if (angular.isDefined($stateParams.markerId)) {
      // Share meter selected.
      $scope.meterSelected = meters.list[$stateParams.markerId];

      // Chart usage information of the selected marker.
      ChartUsage.meterSelected(meters.list[$stateParams.markerId]);
    }


    // Handle lazy-load of electricity data.
    // When cache expands, update the chart.
    $scope.$on("nwElectricityChanged", function(event, filtersHash) {
      // Don't update usageChartData if we're not in the active request.
      if (filtersHash != ChartUsage.getActiveRequestHash()) {
        return;
      }

    });


  });

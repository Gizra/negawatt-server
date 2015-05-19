'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:UsageCtrl
 * @description
 * # UsageCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('UsageCtrl', function ($scope, $state, $stateParams, Chart, usage, meters) {
    var vm = this;

    // Popuate the electricity data into the UI.
    vm.electricity = usage;

    // Get the parameters chart frecuency.
    if (angular.isDefined($stateParams.chartFreq)) {
      Chart.setActiveFrequency($stateParams.chartFreq);
    }

    // Get from parameters information of the selected marker.
    if (angular.isDefined($stateParams.markerId)) {
      // Share meter selected.
      $scope.meterSelected = meters.list[$stateParams.markerId];

      // @TODO: Fix Chart usage information of the selected marker. (Mutiple charts)
      // ChartUsage.meterSelected(meters.list[$stateParams.markerId]);
    }

    // Handle lazy-load of electricity data.
    // When cache expands, update the chart.
    // @TODO:
    $scope.$on("nwElectricityChanged", function(event, filtersHash) {
      // Don't update usageChartData if we're not in the active request.
      //if (filtersHash != ChartUsage.getActiveRequestHash()) {
      //  return;
      //}
    });

  });

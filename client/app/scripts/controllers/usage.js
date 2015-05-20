'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:UsageCtrl
 * @description
 * # UsageCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('UsageCtrl', function ($scope, $state, $stateParams, Electricity, Chart, meters, filters) {
    var vm = this;

    // Popuate the electricity data into the UI.
    //vm.electricity = usage;
    vm.electricity = {};

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

    //Electricity.get(FilterFactory.get('activeElectricityHash'))

    //resolve: {
    //  // Get electricity data and transform it into chart format.
    //  usage: function(FilterFactory, Electricity, filters) {
    //    return Electricity.get(FilterFactory.get('activeElectricityHash'));
    //  }
    //},

    if (filters.loadElectricity) {
      Electricity.refresh();
    }

    // Handle lazy-load of electricity data.
    // When cache expands, update the chart.
    // @TODO:
    $scope.$on("nwElectricityChanged", function(event, filtersHash) {
      console.log(event, filtersHash);
      //Don't update usageChartData if we're not in the active request.
      //if (filtersHash != ChartUsage.getActiveRequestHash()) {
      //  return;
      //}
    });

  });

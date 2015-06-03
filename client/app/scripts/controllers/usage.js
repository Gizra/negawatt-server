'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:UsageCtrl
 * @description
 * # UsageCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('UsageCtrl', function UsageCtrl($scope, $state, $stateParams, Electricity, Chart, ChartUsagePeriod, meters, filters) {
    var vm = this;

    // Popuate the electricity data into the UI.
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

    // Handle lazy-load of electricity data.
    // When cache expands, update the chart.
    $scope.$on("nwElectricityChanged", function(event, electricity) {
      // Update electricity object.
      vm.electricity = angular.isDefined(electricity) && electricity;
      event.preventDefault();
    });


    // Set the limits of the Chart Usage.
    // ChartUsagePeriod.setLimits(filters.limits);

    /**
     * Force load of the electricity data.
     */
    if (filters.loadElectricity) {
      // Realize the first load electricity data after ui-roter resolutions.
      Electricity.refresh(filters.activeElectricityHash);
    }

  });

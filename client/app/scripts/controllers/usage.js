'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:UsageCtrl
 * @description
 * # UsageCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('UsageCtrl', function UsageCtrl($scope, $state, $stateParams, $filter, Electricity, Chart, ChartUsagePeriod, FilterFactory, meters, filters, ChartElectricityUsage) {
    var vm = this;
    var getChartPeriod = ChartUsagePeriod.getChartPeriod;

    // Populate the electricity data into the UI.
    vm.electricity;

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

    /**
     * Electricity Service Event: When electricity collection change update
     * the active electricity (electricity data from a specific period) to
     * usage chart directive.
     */
    $scope.$on("nwElectricityChanged", function(event, electricity) {
      var missingPeriod;

      if (angular.isUndefined(electricity)) {
        return;
      }

      // Save if the period id missing on electricity request, otherwhise false.
      missingPeriod = $filter('activeElectricityFilters')(electricity, 'noData');

      if (!getChartPeriod().isConfigured()) {
        // Configure the period for the chart frequency selected, and request
        // specific electricity data.
        ChartUsagePeriod.config($filter('activeElectricityFilters')(electricity, 'limits'));
      }

      if (missingPeriod && getChartPeriod().isConfigured()) {
        ChartElectricityUsage.requestElectricity(ChartUsagePeriod.stateParams);
        return;
      }

      // Update electricity property with active electricity (if the response has data).
      vm.electricity = $filter('activeElectricityFilters')(electricity);
    });

    /**
     * Force load of the electricity data.
     */
    if (filters.loadElectricity) {
      // Realize the first load electricity data after ui-roter resolutions.
      Electricity.refresh(filters.activeElectricityHash);
    }

  });

'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:UsageCtrl
 * @description
 * # UsageCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('UsageCtrl', function UsageCtrl($scope, $state, $stateParams, $filter, Electricity, Chart, ChartUsagePeriod, FilterFactory, meters, filters, ChartElectricityUsage, categories, profile) {
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

    // Set the current selection label.
    if ($stateParams.markerId) {
      // Set marker label.
      $scope.title = meters.list[$stateParams.markerId] ? meters.list[$stateParams.markerId].label : null;
    }
    else if ($stateParams.categoryId) {
      // When no marker is selected fetch category label.
      $scope.title = categories.list[$stateParams.categoryId] ? categories.list[$stateParams.categoryId].label : null;
    }
    else {
      // Otherwise display account label.
      // Find the current selected account in the user's accounts.
      angular.forEach(profile.account, function(account) {
        if (account.id == $stateParams.accountId) {
          $scope.title = account.label;
        }
      });
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

'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:DetailedChartCtrl
 */
angular.module('negawattClientApp')
  .controller('DetailedChartCtrl', function DetailedChartCtrl($scope, $state, $stateParams, $filter, Electricity, Chart, ChartUsagePeriod, FilterFactory, meters, filters, ChartElectricityUsage, categories, profile, electricityMock) {
    var vm = this;

    var getChartPeriod = ChartUsagePeriod.getChartPeriod;
    var compareWith;
    var options;

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
    }

    options = {
      'isStacked': 'true',
      'fill': 20,
      'displayExactValues': true,
      'height': '500',
      'width': '768',
      'series': {
        0: {targetAxisIndex: 0},
        1: {
          targetAxisIndex: 1,
          type: 'line'
        }
      },
      'vAxes': {
        0: {
          'title': 'Set a title vAxis (Ex. Electricity)',
          'gridlines': {
            'count': 6
          }
        },
        1: {
          'title': 'Set a title vAxis (Ex. Temperature)',
          'gridlines': {
            'count': 6
          },
          'chart_type': 'LineChart',
        }
      },
      'hAxis': {
        'title': 'Set a title hAxis'
      }
    };


    // Mock active frequency.
    Chart.setActiveFrequency(2);

    vm.electricity = $filter('toChartDataset')(electricityMock.electricity, compareWith, options, 'ColumnChart');
    console.log(vm.electricity);



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

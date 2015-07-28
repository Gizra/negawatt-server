'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:DetailedChartCtrl
 */
angular.module('negawattClientApp')
  .controller('DetailedChartCtrl', function DetailedChartCtrl($scope, $state, $stateParams, $filter, Electricity, Chart, ChartUsagePeriod, FilterFactory, meters, filters, ChartElectricityUsage, categories, profile, electricityMock) {
    var vm = this;


    var compareCollection;
    var options;

    $scope.categories = categories;

    // Get the parameters chart frecuency.
    if (angular.isDefined($stateParams.chartFreq)) {
      Chart.setActiveFrequency($stateParams.chartFreq);
    }

    // Get from parameters information of the selected marker.
    if (angular.isDefined($stateParams.markerId)) {
      // Share meter selected.
      $scope.meterSelected = meters.list[$stateParams.markerId];
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
     * Force load of the electricity data.
     */
    if (filters.loadElectricity) {
      // Realize the first load electricity data after ui-roter resolutions.
      Electricity.refresh(filters.activeElectricityHash);
    }
  });

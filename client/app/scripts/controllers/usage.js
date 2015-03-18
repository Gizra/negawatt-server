'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:UsageCtrl
 * @description
 * # UsageCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('UsageCtrl', function ($scope, $q, $location, $state, $stateParams, $urlRouter, account, usage, meters, ChartUsage) {
    // Get data from the cache, since 'usage' might not be up to date
    // after lazy-load.
    $scope.frequencies = ChartUsage.getFrequencies();

    var chart = ChartUsage.get(account.id, $stateParams, meters);
    // Revolve promise
    chart.then(function(response) {
      $scope.usageChartData = $scope.usageChartData || response;
      chart = undefined;
    });


    /**
    * Search the data with the new chart frequency.
    *
    * @param period
    *   Period of time expresed in timestamp, used to request specific electricity data.
    */
    $scope.select = function(period) {

      if (!period) {
        // Prevent only one execution.
        if ($stateParams.chartFreq !== this.frequencies[this.$index].type) {
          $stateParams.chartFreq = this.frequencies[this.$index].type;
          // Load electricity data in the chart according the chart frequency.
          $scope.isLoading = true;

          ChartUsage.get(account.id, $stateParams, meters, period).then(function(response) {
            $scope.usageChartData = response;
            $scope.isLoading = false;
          });

          $location.search('chartFreq', $stateParams.chartFreq);
          $urlRouter.update(true);
        }
      }
      else {
        // Load electricity data in the chart according the chart frequency.
        $scope.isLoading = true;

        ChartUsage.get(account.id, $stateParams, meters, period).then(function(response) {
          $scope.usageChartData = response;
          $scope.isLoading = false;
        });
      }

    }

    // Handle lazy-load of electricity data.
    // When cache expands, update the chart.
    $scope.$on("nwElectricityChanged", function(event, filtersHash) {

      // Don't update usageChartData if we're not in the active request.
      if (filtersHash != ChartUsage.getActiveRequestHash()) {
        return;
      }

      // Update data in the chart.
      ChartUsage.getByFiltersHash(filtersHash).then(function(response) {
        $scope.usageChartData = response;
      });
    });

    // Active the seleced chart frequency.
    function setActiveFrequencyTab(frequency) {
      frequency.active = true;
    }
    if (angular.isDefined($stateParams.chartFreq)) {
      setActiveFrequencyTab($scope.frequencies[$stateParams.chartFreq-1])
    }

    // Detail information of the selected marker.
    if (angular.isDefined($stateParams.markerId)) {
      // Share meter selected.
      $scope.meterSelected = meters[$stateParams.markerId];

      // Chart usage information of the selected marker.
      ChartUsage.meterSelected(meters[$stateParams.markerId]);
    }


  });

'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:UsageCtrl
 * @description
 * # UsageCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('UsageCtrl', function ($scope, $location, $stateParams, usage, meters, ChartUsage) {
    // Get data from the cache, since 'usage' might not be up to date
    // after lazy-load.
    ChartUsage.get($stateParams).then(function(data) {
      $scope.usageChart = data;
    });
    $scope.frequencies = ChartUsage.getFrequencies();

    /**
     * Search the data with the new chart frequency.
     */
    $scope.select = function() {
      // Prevent only one excetion.
      if ($stateParams.chartFreq !== this.frequencies[this.$index].type) {
        $stateParams.chartFreq = this.frequencies[this.$index].type;
        // Load electricity data in the chart according the chart frequency.
        ChartUsage.get($stateParams).then(function(data) {
          $scope.usageChart = data;
          console.log('$scope.usageChart', $scope.usageChart);
        });

        //console.log('select Tab validated');
        $location.search('chartFreq', $stateParams.chartFreq);
      }
    }

    // Active the seleced chart frequency.
    function setActiveFrequencyTab(frequency) {
      frequency.active = true;
    }
    if (angular.isDefined($stateParams.chartFreq)) {
      console.log('setActiveFrequencyTab');
      setActiveFrequencyTab($scope.frequencies[$stateParams.chartFreq-1])
    }

    // Detail information of the selected marker.
    if (angular.isDefined($stateParams.markerId)) {
      // Share meter selected.
      $scope.meterSelected = meters[$stateParams.markerId];

      // Chart usage information of the selected marker.
      ChartUsage.meterSelected(meters[$stateParams.markerId]);
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

'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:UsageCtrl
 * @description
 * # UsageCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('UsageCtrl', function ($scope, $q, $location, $state, $stateParams, $urlRouter, ChartUsage, UsagePeriod, limits, account, usage, meters) {
    var chartUpdated;
    // The initialization in a empty object is need it to avoid an error in the initial rendering.
    $scope.usageChartData = {};

    // Get chart frequencies.
    $scope.frequencies = ChartUsage.getFrequencies();

    // Set period limits, according the state.
    UsagePeriod.setLimits(limits);

    // Get data from the cache, since 'usage' might not be up to date
    // after lazy-load.
    var chart = ChartUsage.get(account.id, $stateParams, meters.list, UsagePeriod.getPeriod());
    chart.then(function(response) {
      $scope.usageChartData = $scope.usageChartData || response;
      chart = undefined;
    });

    // Get the parameters chart frecuency.
    if (angular.isDefined($stateParams.chartFreq)) {
      setActiveFrequencyTab($scope.frequencies[$stateParams.chartFreq-1]);
    }

    // Get from parameters information of the selected marker.
    if (angular.isDefined($stateParams.markerId)) {
      // Share meter selected.
      $scope.meterSelected = meters.list[$stateParams.markerId];

      // Chart usage information of the selected marker.
      ChartUsage.meterSelected(meters.list[$stateParams.markerId]);
    }


    // Active the seleced chart frequency.
    function setActiveFrequencyTab(frequency) {
      frequency.active = true;
    }

    /**
     * Keep parameters syncronization between url and router.
     *
     * @param params
     *  Parameters of the current search.
     */
    function syncUrl(params) {
      $location.search(params);
      $urlRouter.update(true);
      chartUpdated = true;
    }

    /**
     * Search the data with the new chart frequency.
     *
     * @param params
     *   Search params used to the query string the next time.
     * @param period
     *   Period of time expresed in timestamp, used to request specific electricity data.
     */
    function updateUsageChart(params, period) {

      // In case the state activation is enter via URL.
      if (angular.isUndefined(period) && !$state.transition && (angular.isDefined($stateParams.chartNextPeriod) || angular.isDefined($stateParams.chartNextPeriod) )) {
        period = {
          next: $stateParams.chartNextPeriod,
          previous: $stateParams.chartPreviousPeriod
        };
        angular.extend(params, {
          chartNextPeriod: $stateParams.chartNextPeriod,
          chartPreviousPeriod: $stateParams.chartPreviousPeriod
        });
      }

      // Load electricity data in the chart according the chart frequency.
      $scope.isLoading = true;

      // Extend period with the maximum and minimum time, if a marker is selected.
      if (angular.isDefined($stateParams.markerId)) {
        period = angular.extend(period || {}, meters.list[$stateParams.markerId] && meters.list[$stateParams.markerId].electricity_time_interval);
      }

      ChartUsage.get(account.id, $stateParams, meters.list, period).then(function(response) {
        $scope.usageChartData = response;
        $scope.isLoading = false;
      });

      syncUrl(params);
    }

    /**
     * Get electricity data in the new chart frequency.
     */
    $scope.changeFrequency = function() {
      var params = {};

      // Change of frequency, request the new electricity data on the selected frequency and prepare
      // the query string to be updated..
      if ( this.frequencies && ($stateParams.chartFreq !== this.frequencies[this.$index].type) ) {
        $stateParams.chartFreq = this.frequencies[this.$index].type;
        // Delete properties in the case we change the frecuency (day, month, year).
        if (chartUpdated) {
          delete $stateParams['chartNextPeriod'];
          delete $stateParams['chartPreviousPeriod'];
        }
      }

      // Query string params.
      angular.extend(params, $location.search(), {
        chartFreq: $stateParams.chartFreq
      });

      // Udpate chart.
      updateUsageChart(params);
    }

    /**
     * Get electricity data for the new period into the chart frequency.
     *
     * @param period
     *  The period to next ot previous to do the new request.
     */
    $scope.changePeriod = function(period) {
      var params = {};

      // Query string params.
      angular.extend(params, {
        chartFreq: $stateParams.chartFreq,
        chartNextPeriod: period.next,
        chartPreviousPeriod: period.previous
      })

      // Udpate chart.
      updateUsageChart(params, period);
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


  });

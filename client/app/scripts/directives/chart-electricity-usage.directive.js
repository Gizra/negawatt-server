'use strict';

angular.module('negawattDirectives', [])
  .directive('chartElectricityUsage', function () {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/directives/chart-electricity-usage.directive.html',
      controller: function(Chart, FilterFactory, $state, $stateParams, $timeout, $urlRouter, $location) {
        var chartCtrl = this;

        // Update data object
        // Get chart frequencies. (Tabs the period of time)
        chartCtrl.frequencies = Chart.get('frequencies');

        /**
         * Change frequency of the chart.
         *
         * @param type
         *  The type of frequency according the period of time selected.
         */
        chartCtrl.changeFrequency = function(type) {
          // Update url with params updated.
          $state.refreshUrlWith({chartFreq: +type});
          return type;

          var params = {};

          // Change of frequency, request the new electricity data on the selected frequency and prepare
          // the query string to be updated..
          if ($stateParams.chartFreq !== type) {
            $stateParams.chartFreq = type;
            // Delete properties in the case we change the frecuency (day, month, year).
            if (chartUpdated) {
              delete $stateParams['chartNextPeriod'];
              delete $stateParams['chartPreviousPeriod'];
            }
          }

          // Udpate chart.
          updateUsageChart(params);
        }

        /**
         * Return true if we have data to show the request chart on the period
         * parameter, otherwise false.
         */
        chartCtrl.hasData = function hasData() {
          return !!chartCtrl.electricity.length;
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
          //$scope.isLoading = true;

          // Extend period with the maximum and minimum time, if a marker is selected.
          if (angular.isDefined($stateParams.markerId)) {
            period = angular.extend(period || {}, meters.list[$stateParams.markerId] && meters.list[$stateParams.markerId].electricity_time_interval);
          }

          // @TODO: Implement ChartUsage.render();
          //ChartUsage.get(account.id, $stateParams, period).then(function(response) {
          //  $scope.usageChartData = response;
          //  $scope.isLoading = false;
          //});

        }
      },
      controllerAs: 'ctrlChart',
      bindToController: true,
      // Isolate scope.
      scope: {
        electricity: '='
      }
    };
  });

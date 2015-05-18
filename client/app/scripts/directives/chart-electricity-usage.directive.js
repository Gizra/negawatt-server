'use strict';

angular.module('negawattDirectives', [])
  .directive('chartElectricityUsage', function () {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/directives/chart-electricity-usage.directive.html',
      controller: function(Chart, FilterFactory, $state) {
        var chartCtrl = this;

        // Get chart frequencies. (Tabs the period of time)
        chartCtrl.frequencies = Chart.get('frequencies');

        /**
         * Change frequency of the chart.
         *
         * @param type
         *  The type of frequency according the period of time selected.
         */
        chartCtrl.changeFrequency = function(type) {
          console.log(type);
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

          // Query string params.
          angular.extend(params, $location.search(), {
            chartFreq: $stateParams.chartFreq
          });

          // Udpate chart.
          updateUsageChart(params);
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

          syncUrl(params);
        }
      },
      controllerAs: 'ctrlChart',
      bindToController: true,
      // Isolate scope.
      scope: {
        account: '='
      }
    };
  });

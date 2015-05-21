'use strict';

angular.module('negawattDirectives', [])
  .directive('chartElectricityUsage', function () {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/directives/chart-electricity-usage.directive.html',
      controller: function chartElectricityUsageCtrl(Chart, FilterFactory, Electricity, $state, $stateParams, $timeout, $urlRouter, $location, $filter, $scope) {
        var ctrlChart = this;

        // Update the electricity data.
        $scope.$watch('ctrlChart.electricity', function(current) {
          ctrlChart.data = $filter('toChartDataset')($filter('activeElectricityFilters')(ctrlChart.electricity));
        }, true);

        // Update data object
        // Get chart frequencies. (Tabs the period of time)
        ctrlChart.frequencies = Chart.getFrequencies();

        /**
         * Change frequency of the chart.
         *
         * @param type
         *  The type of frequency according the period of time selected.
         */
        ctrlChart.changeFrequency = function(type) {
          // Update the electricity filters.
          updateElectricityFilters(type);

          // Update with the actual data.
          ctrlChart.data = $filter('toChartDataset')($filter('activeElectricityFilters')(ctrlChart.electricity));

          // Refresh electricity data.
          Electricity.refresh(FilterFactory.get('activeElectricityHash'));

          //var params = {};
          //
          //// Change of frequency, request the new electricity data on the selected frequency and prepare
          //// the query string to be updated..
          //if ($stateParams.chartFreq !== type) {
          //  $stateParams.chartFreq = type;
          //  // Delete properties in the case we change the frecuency (day, month, year).
          //  if (chartUpdated) {
          //    delete $stateParams['chartNextPeriod'];
          //    delete $stateParams['chartPreviousPeriod'];
          //  }
          //}
          //
          //// Udpate chart.
          //updateUsageChart(params);
        }

        /**
         * Return true if we have data to show the request chart on the period
         * parameter, otherwise false.
         */
        ctrlChart.hasData = function hasData() {
          return !!$filter('activeElectricityFilters')(ctrlChart.electricity).length;
        }

        /**
         * Messages to show when there is no data.
         *
         * @type {{empty: string}}
         */
        ctrlChart.messages = {
          empty: Chart.messages.empty
        };

        /**
         * Update the electricity filters in UI-Router and FilterFactory
         *
         * @param type
         *  The chart requency selected
         */
        function updateElectricityFilters(type) {
          // Update url with params updated.
          angular.extend($stateParams, {chartFreq: +type});
          $state.refreshUrlWith($stateParams);
          // Refresh the electricity filters as active, and generate new hash.
          FilterFactory.set('electricity', $stateParams);
        }

        /**
         * Search the data with the new chart frequency.
         *
         * @param params
         *   Search params used to the query string the next time.
         * @param period
         *   Period of time expresed in timestamp, used to request specific electricity data.
         */
        //function updateUsageChart(params, period) {
        //
        //  // In case the state activation is enter via URL.
        //  if (angular.isUndefined(period) && !$state.transition && (angular.isDefined($stateParams.chartNextPeriod) || angular.isDefined($stateParams.chartNextPeriod) )) {
        //    period = {
        //      next: $stateParams.chartNextPeriod,
        //      previous: $stateParams.chartPreviousPeriod
        //    };
        //    angular.extend(params, {
        //      chartNextPeriod: $stateParams.chartNextPeriod,
        //      chartPreviousPeriod: $stateParams.chartPreviousPeriod
        //    });
        //  }
        //
        //  // Load electricity data in the chart according the chart frequency.
        //  //$scope.isLoading = true;
        //
        //  // Extend period with the maximum and minimum time, if a marker is selected.
        //  if (angular.isDefined($stateParams.markerId)) {
        //    period = angular.extend(period || {}, meters.list[$stateParams.markerId] && meters.list[$stateParams.markerId].electricity_time_interval);
        //  }
        //
        //  // @TODO: Implement ChartUsage.render();
        //  //ChartUsage.get(account.id, $stateParams, period).then(function(response) {
        //  //  $scope.usageChartData = response;
        //  //  $scope.isLoading = false;
        //  //});
        //
        //}
      },
      controllerAs: 'ctrlChart',
      bindToController: true,
      // Isolate scope.
      scope: {
        electricity: '='
      }
    };
  });

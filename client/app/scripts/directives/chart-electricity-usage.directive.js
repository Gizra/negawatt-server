'use strict';

angular.module('negawattDirectives', [])
  .directive('chartElectricityUsage', function () {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/directives/chart-electricity-usage.directive.html',
      controller: function chartElectricityUsageCtrl(ChartUsagePeriod, FilterFactory, Electricity, $state, $stateParams, $timeout, $urlRouter, $location, $filter, $scope) {
        var ctrlChart = this;

        // Update the Chart data every time the electricity data.
        $scope.$watch('ctrlChart.electricity', function(current) {
          console.log('watch', current);
          ctrlChart.data = $filter('toChartDataset')($filter('activeElectricityFilters')(ctrlChart.electricity));
        }, true);

        ctrlChart.__period = ChartUsagePeriod.getPeriod;
        // Update data object
        // Get chart frequencies. (Tabs the period of time)
        ctrlChart.frequencies = ChartUsagePeriod.getFrequencies();
        // Check if next/previous period have data.
        ctrlChart.showNavigation = ChartUsagePeriod.hasPeriod;

        /**
         * Change frequency of the chart.
         *
         * @param type
         *  The type of frequency according the period of time selected.
         */
        ctrlChart.changeFrequency = function(type) {
          // Update the electricity filters.
          updateElectricityFilters(angular.extend({chartFreq: +type}, getPeriodParams()));

          refreshChart();
        }

        /**
         * Change the actual period to next or previous.
         *
         * @param type
         *  String indicate the direction of the new period next or previous.
         */
        ctrlChart.changePeriod = function(type) {
          var newPeriod = ChartUsagePeriod.changePeriod(type);

          // Update Electricity Filter.
          updateElectricityFilters({chartNextPeriod: newPeriod.next, chartPreviousPeriod: newPeriod.previous});

          refreshChart();
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
          empty: ChartUsagePeriod.messages.empty
        };

        /**
         * Update the electricity filters in UI-Router and FilterFactory
         *
         * @param params
         *  The new parameters to be updated on the filters.
         */
        function updateElectricityFilters(params) {
          // Update url with params updated.
          angular.extend($stateParams, params);
          $state.refreshUrlWith($stateParams);
          // Refresh the electricity filters as active, and generate new hash.
          FilterFactory.set('electricity', $stateParams);
        }

        /**
         * Update chart with cache data or clean an get the new data from
         * electricity. Generally update data deom
         */
        function refreshChart() {
          // Update with the actual data.
          ctrlChart.data = $filter('toChartDataset')($filter('activeElectricityFilters')(ctrlChart.electricity));

          // Refresh electricity data.
          Electricity.refresh(FilterFactory.get('activeElectricityHash'));
        }

        /**
         * Get the actual period, in a params format.
         *
         * @returns {*}
         */
        function getPeriodParams() {
          var period;
          // Define default period.
          if (angular.isUndefined($stateParams.chartNextPeriod) || angular.isUndefined($stateParams.chartPreviousPeriod)) {
            ChartUsagePeriod.setPeriod();
          }

          period = ChartUsagePeriod.getPeriod();

          return {
            chartNextPeriod: period.next,
            chartPreviousPeriod: period.previous
          };
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

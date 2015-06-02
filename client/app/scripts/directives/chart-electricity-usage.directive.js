'use strict';

angular.module('negawattDirectives', [])
  .directive('chartElectricityUsage', function () {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/directives/chart-electricity-usage.directive.html',
      controller: function chartElectricityUsageCtrl(Utils, ChartUsagePeriod, FilterFactory, Electricity, $state, $stateParams, $timeout, $urlRouter, $location, $filter, $scope) {
        var ctrlChart = this;

        // Update the Chart data every time the electricity data.
        $scope.$watch('ctrlChart.electricity', function(current) {
          if (Utils.isEmpty(current)) {
            return;
          }

          ctrlChart.isLoading = false;

          // Set limits and data to charts, wuth the active electricity request.
          ChartUsagePeriod.setLimits($filter('activeElectricityFilters')(ctrlChart.electricity, 'limits'));
          ctrlChart.data = $filter('toChartDataset')($filter('activeElectricityFilters')(ctrlChart.electricity));
        }, true);

        $scope.$watch('ctrlChart.data.type', function(current) {
          ctrlChart.data.type = current;
        });

        ctrlChart.__period = ChartUsagePeriod.getPeriod;
        // Update data object.
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
          // Update the electricity filters, only if are in the period change.
          updateElectricityFilters(angular.extend({chartFreq: +type}, getPeriodParams(type)));

          // Refresh chart type;

          ctrlChart.hasData && refreshChart();
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

          ctrlChart.hasData && refreshChart();
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
          // Check if

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
          //var dataset = $filter('activeElectricityFilters')(ctrlChart.electricity);
          ctrlChart.isLoading = true;
          Electricity.refresh(FilterFactory.get('activeElectricityHash'));
          // Update with the actual data.
          //ctrlChart.data = $filter('toChartDataset')(dataset);

          // Refresh electricity data.
        }

        /**
         * Get the actual period, from URL or default Pariod values.
         * the object is returning in in a URL query string parameters format.
         *
         *
         * @param type
         *  The size of the period thata we wnats to return.
         *
         * @returns {{chartNextPeriod: *, chartPreviousPeriod: *}}
         */
        function getPeriodParams(type) {

          // Set frequency selected as active.
          ChartUsagePeriod.setActiveFrequency(type);

          // Set URL Period ({previous: number, next: number}) using $stateParams period parameters.
          ChartUsagePeriod.setPeriod({
            next: $stateParams.chartNextPeriod,
            previous: $stateParams.chartPreviousPeriod
          });

          // Return a new paramenter from a Period previuos defined and saved.
          return {
            chartNextPeriod: ChartUsagePeriod.getPeriod().next,
            chartPreviousPeriod: ChartUsagePeriod.getPeriod().previous
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

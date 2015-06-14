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
          var limits,
            period;

          if (Utils.isEmpty(current)) {
            return;
          }

          // Directive configuration in case the Chart Period
          if (!ChartUsagePeriod.getPeriod().isConfigured()) {
            // Define the first period.
            limits = $filter('activeElectricityFilters')(ctrlChart.electricity, 'limits');
            ChartUsagePeriod.config(limits);
            period = ChartUsagePeriod.getPeriod();
          }

          if (FilterFactory.get('electricity-nodata')) {
            // Update parameters an refreshChart.
            if (period) {
              updateElectricityFilters({chartFreq: period.chart && +period.chart.type, chartNextPeriod: period.next, chartPreviousPeriod: period.previous});
              refreshChart();
            }
          }
          else {
            // Render the chart with the active selected data.
            render();

          }
          // Clear the spinner.
          ctrlChart.isLoading = false;

        }, true);

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
          $scope.$on('activeMeter', function(meter) {
            // Update the electricity filters, only if are in the period change.
            updateElectricityFilters({chartFreq: +type, chartNextPeriod: null, chartPreviousPeriod: null}, true);

            // Redraw the chart.
            render();

            // Refresh chart type.
            ctrlChart.hasData && refreshChart();
          });

          if (FilterFactory.get('meter')) {
            return;
          }
          else
          {

            // Update the electricity filters, only if are in the period change.
            updateElectricityFilters({chartFreq: +type, chartNextPeriod: null, chartPreviousPeriod: null}, true);

            // Redraw the chart.
            render();

            // Refresh chart type.
            ctrlChart.hasData && refreshChart();
          }


        }

        /**
         * Change the actual period to next or previous.
         *
         * @param periodDirection
         *  String indicate the direction of the new period next or previous.
         */
        ctrlChart.changePeriod = function(periodDirection) {
          var newPeriod = ChartUsagePeriod.changePeriod(periodDirection);

          // Update Electricity Filter.
          updateElectricityFilters({chartNextPeriod: newPeriod.next, chartPreviousPeriod: newPeriod.previous});

          ctrlChart.hasData && refreshChart();
        }

        /**
         * Return true if we have data to show the request chart on the period
         * parameter, otherwise false.
         */
        ctrlChart.hasData = function hasData() {
          return !!$filter('activeElectricityFilters')(ctrlChart.electricity).length || false;
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
         * @param reset
         *  Reset first the previuos filters.
         */
        function updateElectricityFilters(params, reset) {
          reset && ChartUsagePeriod.reset();
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
          ctrlChart.isLoading = true;
          // Update with the actual data.

          // Refresh electricity data.
          Electricity.refresh(FilterFactory.get('activeElectricityHash'));
          // Redraw the chart.
          render();
        }

        /**
         * Redender the chart with the frequency and period selected.
         */
        function render() {
          var period;
          var electricity = ctrlChart.electricity[FilterFactory.get('activeElectricityHash')];

          // Request no cached.
          if (angular.isUndefined(electricity)) {
            ctrlChart.data = $filter('toChartDataset')($filter('activeElectricityFilters')(ctrlChart.electricity));
          }
          else {

            if (electricity.noData) {
              // Get cache data.
              ChartUsagePeriod.setActiveFrequency($stateParams.chartFreq);
              ChartUsagePeriod.config(electricity.limits);
              period = ChartUsagePeriod.getPeriod();
              updateElectricityFilters({chartFreq: +period.chart.type, chartNextPeriod: period.next, chartPreviousPeriod: period.previous});

              // Render new period data.
              render();
            }
            else {

              // Load cache data
              ctrlChart.data = $filter('toChartDataset')(electricity.data);
            }
          }


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

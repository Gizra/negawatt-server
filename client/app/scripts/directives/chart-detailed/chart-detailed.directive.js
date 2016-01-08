'use strict';

angular.module('negawattClientApp')
  .directive('chartDetailedTabs', function() {
    return {
      templateUrl: 'scripts/directives/chart-detailed/chart-detailed-tabs.directive.html',
      controller: function ChartDetailedCtrlTabs($scope, $rootScope, Chart, $filter, ChartUsagePeriod) {

        var ctrlChartTabs = this;

        ChartUsagePeriod.config();

        // Get chart frequencies (in order to draw frequency tabs)
        ctrlChartTabs.frequencies = ChartUsagePeriod.getFrequencies();

        // Handler for click in frequency tab.
        ctrlChartTabs.changeFrequency = function(frequency) {
          // Broadcast to all detailed-chart-directives to change frequency.
          $rootScope.$broadcast('nwFrequencyChanged', frequency);
          // Also tell all charts to go to 'loading' state.
          $rootScope.$broadcast('nwChartBeginLoading');
        };
      },
      controllerAs: 'ctrlChartTabs'
    };
  })

  .directive('chartDetailedDatePicker', function () {
    return {
      scope: {
        referenceDate: '=',
        showCompareChart: '=',
        showCompareChartButton: '='
      },
      templateUrl: 'scripts/directives/chart-detailed/chart-detailed-date-selector.directive.html',
      controller: function ChartDetailedDatePickerCtrl($scope, $stateParams, $timeout) {

        var ctrlChartDatePicker = this;

        var dateOptions = {
          1: {
            frequency: 1,
            'datepicker-mode': "'year'",
            'min-mode': "year",
            'format': 'yyyy',
          },
          2: {
            frequency: 2,
            'datepicker-mode': "'year'",
            'min-mode': "year",
            'format': 'yyyy'
          },
          3: {
            frequency: 3,
            'datepicker-mode': "'month'",
            'min-mode': "month",
            'formatMonth': 'MMM',
            'format': 'MM/yyyy'
          },
          4: {
            frequency: 4,
            'formatMonth': 'MMM',
            'showWeeks': false,
            'format': 'dd/MM/yy'
          },
          5: {
            frequency: 5,
            'formatMonth': 'MMM',
            'showWeeks': false,
            'format': 'dd/MM/yy'
          }
        };

        ctrlChartDatePicker.minDate = undefined;
        ctrlChartDatePicker.maxDate = undefined;
        ctrlChartDatePicker.dateOptions = dateOptions;
        ctrlChartDatePicker.chartFreq = $stateParams.chartFreq;

        // Open date selector popup.
        ctrlChartDatePicker.open = function (dateOption) {
          $timeout(function () {
            dateOption.opened = true;
          });
        };

        /**
         * Handle change in frequency.
         */
        ctrlChartDatePicker.frequencyChanged = function (chartFreq) {
          ctrlChartDatePicker.chartFreq = chartFreq;
        };

        /**
         * Change the actual period to next or previous, and request the new
         * electricity data.
         *
         * @param periodDirection
         *  String either 'next' or 'previous'.
         */
        ctrlChartDatePicker.changePeriod = function (periodDirection) {
          // Pass the event to the parent ChartDetailedCtrl.
          $scope.$parent.chart.changePeriod(periodDirection);
        };

        /**
         * Capture change in $stateParams to update chartFreq binding.
         */
        $scope.$on('$locationChangeSuccess', function(event) {
          ctrlChartDatePicker.frequencyChanged($stateParams.chartFreq);
        });

      },
      bindToController: true,
      controllerAs: 'ctrlChartDatePicker'
    }
  })

  .directive('chartDetailed', function () {
    return {
      templateUrl: 'scripts/directives/chart-detailed/chart-detailed.directive.html',
      controller: function ChartDetailedCtrl($scope, $rootScope, $window, $filter, ChartDetailedService, ChartOptions, ChartUsagePeriod, $stateParams, ApplicationState) {
        var chart = this;

        // Expose some functions.
        this.takeElectricity = takeElectricity;

        // Register in ApplicationState.
        ApplicationState.registerDetailedChart(this);

        // Extend the service with the scope of the directive and
        // extend the controller of the directive with the service.
        angular.extend(chart, ChartDetailedService);

        // Default values of the properties.
        chart.electricity = {};
        chart.summary = {};
        chart.pieOptions = {};
        chart.frequency = $stateParams.chartFreq;
        chart.account = $stateParams.accountId;

        var period = ChartUsagePeriod;
        period.config();

        // To first get electricity with noData option.
        chart.checkTimeRange = true;

        // Expose functions.
        chart.filtersChanged = filtersChanged;
        chart.changePeriod = changePeriod;

        // Inform to the directive about the filters change.
        filtersChanged();

        // Change filters gent select new frequency.
        $scope.$watch('chart.frequency', function(frequency, previous) {
          if (frequency === previous) {
            return;
          }

          // To get electricity with noData option.
          chart.checkTimeRange = true;

          filtersChanged();
        }, true);

        // Update chart with compareWith information.
        $scope.$watch('chart.siteProperties', function(siteProperties, previous) {
          if (siteProperties === previous || angular.isUndefined(siteProperties)) {
            return;
          }
          chart.compareWith = siteProperties.compareWith;
          chart.meter = siteProperties.meter;

          refreshChart();
        }, true);

        /**
         * Get the new electricity collection according the filters and
         * render the data in the chart.
         */
        function refreshChart() {
          // Tell all charts to go to 'loading' state.
          $rootScope.$broadcast('nwChartBeginLoading');

          // Prepare filters to get electricity.
          var filters = {
            accountId: $stateParams.accountId,
            chartFreq: $stateParams.chartFreq,
            chartPreviousPeriod: period.getChartPeriod().previous,
            chartNextPeriod: period.getChartPeriod().next,
            sel: $stateParams.sel,
            ids: $stateParams.ids,
            noData: chart.checkTimeRange
          };

          // Define chart configuration.
          var config = {
            chartFreq: chart.frequency,
            compareWith: chart.compareWith
          };
          setChartOptions(config);

          // Update date-range text near the chart title.
          chart.dateRange = period.formatDateRange(period.getChartPeriod().previous * 1000, period.getChartPeriod().next * 1000);

          // ReferenceDate is used to communicate with the date selector,
          // update date-selector with current reference date.
          // Note that datepicker's referenceDate is in milliseconds.
          chart.referenceDate = period.getChartPeriod().referenceDate * 1000;

          chart.getElectricity(filters);

          // Get compare collection, if one was selected.
          if ($stateParams.climate) {
            var climateFilters = {
              climate: $stateParams.climate,
              chartFreq: $stateParams.chartFreq,
              chartPreviousPeriod: period.getChartPeriod().previous,
              chartNextPeriod: period.getChartPeriod().next
            };
            // Get climate promise and wait for response.
            ChartDetailedService.getCompareCollection('temperature', climateFilters)
              .then(function(data) {
                chart.compareCollection = data;
              });
          }
        }

        /**
         * Change the actual period to next or previous. Watch on chart.referenceDate
         * will cause reading new electricity and update to the chart.
         *
         * @param periodDirection
         *  String indicate the direction of the new period next or previous.
         */
        function changePeriod(periodDirection) {
          period.changePeriod(periodDirection);
          refreshChart();
        }

        /**
         * Set the chart options according a configuration.
         */
        function setChartOptions(config) {
          chart.options = ChartOptions.getOptions(config.chartFreq, config.chartType, !!config.compareWith);
        }

        /**
         * On the change of the filters render the chart with the new data.
         */
        function filtersChanged() {
          refreshChart();
        }

        /**
         * Handler for frequency change.
         *
         * Set parameters, re-check time frame, and redraw the charts.
         */
        $scope.$on('nwFrequencyChanged', function(event, frequency) {
          // Next electricity fetch will first bring time-range (noData mode).
          chart.checkTimeRange = true;
          chart.frequency = frequency.type;

          period.changeFrequency(frequency.type);

          // Update parameters and fetch electricity.
          refreshChart();
        });

        /**
         * Handler for frequency change.
         *
         * Set parameters, re-check time frame, and redraw the charts.
         */
        $scope.$watch('chart.referenceDate', function(newDate, oldDate) {
          if (oldDate == newDate || newDate == period.getReferenceDate()) {
            return;
          }

          // Datepicker's referenceDate is in milliseconds.
          period.setReferenceDate(newDate / 1000);

          // Update parameters and fetch electricity.
          refreshChart();
        });

        /**
         * Electricity Service Event: When electricity changes, update charts with
         * new consumption data.
         *
         * Actually, the handler receives the event after electricity is loaded with
         * nodata=1 (to get min/max timestamps for new frequency), and refreshChart()
         * asks for new electricity data (without the nodata=1 parameter).
         */
        // FIXME: Delete this $on()
        $scope.$on('nwElectricityChanged', function(event, electricity) {
          if (!chart.checkTimeRange) {
            // Not checking time range, take electricity data.
            chart.electricity = electricity.data;
            chart.summary = electricity.summary;
            return;
          }

          // Got only summary with time range.
          // Save it, fix the time-range for the chart, and request the real data.
          chart.checkTimeRange = false;

          // Set time range.
          var params = {
            min: electricity.summary.timestamp.min,
            max: electricity.summary.timestamp.max
          };
          period.config(params);

          // Set chart properties and get electricity.
          refreshChart();
        });
        function takeElectricity(electricity) {
          if (!chart.checkTimeRange) {
            // Not checking time range, take electricity data.
            chart.electricity = electricity.data;
            chart.summary = electricity.summary;
            return;
          }

          // Got only summary with time range.
          // Save it, fix the time-range for the chart, and request the real data.
          chart.checkTimeRange = false;

          // Set time range.
          var params = {
            min: electricity.summary.timestamp.min,
            max: electricity.summary.timestamp.max
          };
          period.config(params);

          // Set chart properties and get electricity.
          refreshChart();
        }

        /**
         * Electricity Service Event: When electricity changes, update charts with
         * new consumption data.
         *
         * Actually, the handler receives the event after electricity is loaded with
         * nodata=1 (to get min/max timestamps for new frequency), and refreshChart()
         * asks for new electricity data (without the nodata=1 parameter).
         */
        $scope.$on('nwTemperatureChanged', function(event, climate) {
            // Take climate data.
            chart.compareCollection = climate;
        });

        $scope.$on('setChartTitleTo', function (event, newTitle) {
          chart.title = newTitle;
        });

        /**
         * Watch window width, and update chart parameters to resize the chart.
         */
        $scope.$watch(
          function () { return $window.innerWidth; },
          function () {
            // Window was resized, recalc chart options.
            if (chart.data != undefined) {
              chart.data.options = $filter('toChartDataset')('options-only', $stateParams.chartType);
            }
          },
          true
        );

      },
      controllerAs: 'chart',
      bindToController: true,
      scope: {
        title: '@',
        siteProperties: '=',
        categories: '=',
        hasExtraChart: '=',
        isCompareChart: '=',
        chartObject: '='
      }
    };
  });

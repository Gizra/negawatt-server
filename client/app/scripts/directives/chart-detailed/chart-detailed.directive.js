'use strict';

angular.module('negawattClientApp')
  .directive('chartDetailedTabs', function() {
    return {
      templateUrl: 'scripts/directives/chart-detailed/chart-detailed-tabs.directive.html',
      controller: function ChartDetailedCtrlTabs($scope, Chart, $filter, ChartUsagePeriod, ChartElectricityUsage, $stateParams) {

        var ctrlChartTabs = this;

        // Get chart frequencies (in order to draw frequency tabs)
        ctrlChartTabs.frequencies = ChartUsagePeriod.getFrequencies();

        // Handler for click in frequency tab.
        ctrlChartTabs.changeFrequency = function(frequency) {
          ChartUsagePeriod.changeFrequency(frequency.type);
          ChartElectricityUsage.requestElectricity(ChartUsagePeriod.stateParams);
        };
      },
      controllerAs: 'ctrlChartTabs'
    };
  })

  .directive('chartDetailedDatePicker', function () {
    return {
      scope: {
        showCompareChart: '='
      },
      templateUrl: 'scripts/directives/chart-detailed/chart-detailed-date-selector.directive.html',
      controller: function ChartDetailedDatePickerCtrl($scope, $stateParams, $timeout) {

        var ctrlChartDatePicker = this;

        var now = new Date(),
          dateOptions = {
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
            'format': 'yyyy',
          },
          3: {
            frequency: 3,
            'datepicker-mode': "'month'",
            'min-mode': "month",
            'formatMonth': 'MMM',
            'format': 'MM/yyyy',
          },
          4: {
            frequency: 4,
            'starting-day': 1,
            'formatMonth': 'MMM',
            'showWeeks': false,
            'format': 'dd/MM/yy',
          },
          5: {
            frequency: 5,
            'starting-day': 1,
            'formatMonth': 'MMM',
            'showWeeks': false,
            'format': 'dd/MM/yy',
          }
        };

        ctrlChartDatePicker.dt = now.getTime();
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

        // Handle change in frequency (
        ctrlChartDatePicker.frequencyChanged = function (chartFreq) {
          ctrlChartDatePicker.chartFreq = chartFreq;
        };

        // Capture change in $stateParams to update chartFreq binding.
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
      controller: function ChartDetailedCtrl($scope, $window, $filter, ChartDetailed, ChartOptions, $stateParams) {
        var chart = this;
        var filters;
        var compareCollection;

        // Extend the service with the scope of the directive and
        // extend the controller of the directive with the service.
        angular.extend(chart, ChartDetailed);

        // Default values of the properties.
        chart.electricity = {};
        chart.summary = {};
        chart.pieOptions = {};
        chart.frequency = $stateParams.chartFreq;
        chart.account = $stateParams.accountId;
        chart.startDate = 1433106000;
        chart.endDate = 1370034000;
        chart.siteCategory = 3;

        // TODO: Calculation of data range with the directive and service of dat range.
        chart.dateRange = chart.date;

        chart.filtersChanged = filtersChanged;

        // Inform to the directive about the filters change.
        filtersChanged();

        // Change filters gent select new frequency.
        $scope.$watch('chart.frequency', function(frequency, previous) {
          if (frequency === previous) {
            return;
          }

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
         *
         * @param options
         */
        function refreshChart(options) {
          // chart configuration.
          var config;

          // Get configuration data.
          chart.frequency = $stateParams.chartFreq;
          chart.account = $stateParams.accountId;

          // Prepare filters to get electricity.
          filters = {
            accountId: chart.account,
            chartFreq: chart.frequency,
            chartNextPeriod: chart.startDate,
            chartPreviousPeriod: chart.endDate,
            meter: chart.meter
          };

          // Define chart configuration.
          config = {
            chartFreq: chart.frequency,
            compareWith: chart.compareWith
          };
          setChartOptions(config);

          if (chart.compareWith && chart.meter) {
            chart.compareCollection = ChartDetailed.getCompareCollection(chart.compareWith, filters);
          }

          chart.getElectricity(filters)
            .then(function(electricity) {
              chart.electricity = electricity.data;
              chart.summary = electricity.summary;
            });
        }

        /**
         * Set the chart options according a configuration.
         */
        function setChartOptions(config) {
          chart.options = ChartOptions.getOptions(config.chartFreq, !!config.compareWith);
        }

        /**
         * On the change of the filters render the chart with the new data.
         */
        function filtersChanged() {
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
        $scope.$on('nwElectricityChanged', function(event, electricity) {
          refreshChart();
        });

        /**
         * Watch window width, and update chart parameters to resize the chart.
         */
        $scope.$watch(
          function () {
            return $window.innerWidth;
          },
          function (value) {
            // Window was resized, recalc chart options.
            if (chart.data != undefined) {
              chart.data.options = $filter('toChartDataset')('options-only');
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
        showChartControls: '@',
        chartObject: '='
      }
    };
  });

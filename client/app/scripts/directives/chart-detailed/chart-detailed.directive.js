'use strict';

angular.module('negawattClientApp')
  .directive('chartDetailedTabs', function() {
    return {
      templateUrl: 'scripts/directives/chart-detailed/chart-detailed-tabs.directive.html',
      controller: function ChartDetailedCtrlTabs($scope, $rootScope, Chart, $filter, ChartUsagePeriod) {

        var ctrlChartTabs = this;

        // Get chart frequencies (in order to draw frequency tabs)
        ctrlChartTabs.frequencies = ChartUsagePeriod.getFrequencies();

        // Handler for click in frequency tab.
        ctrlChartTabs.changeFrequency = function(frequency) {
          // Broadcast to all detailed-chart-directives to change frequency.
          $rootScope.$broadcast('nwFrequencyChanged', frequency);
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
      controller: function ChartDetailedDatePickerCtrl($scope, $stateParams, $timeout, ApplicationState) {

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
          ApplicationState.periodChanged(periodDirection);
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
        this.setup = setup;
        this.takeElectricityAndSensorsData = takeElectricityAndSensorsData;

        // Register in ApplicationState.
        ApplicationState.registerDetailedChart(this);

        // Extend the service with the scope of the directive and
        // extend the controller of the directive with the service.
        angular.extend(chart, ChartDetailedService);

        /**
         * Setup basic parameters for chart.
         *
         * @param dateRange string
         *  Subtitle for the chart, indicating the date range.
         * @param referenceDate integer
         *  Reference date.
         *  FIXME: Do we need it?
         */
        function setup(dateRange, referenceDate) {
          chart.dateRange = dateRange;
          chart.referenceDate = referenceDate;
        }

        /**
         * Get new electricity and sensor date from application-state and update chart.
         *
         * @param electricity object
         *  New electricity data, containing both data and summary.
         * @param sensorData object
         *  New sensor data, containing both data and summary.
         * @param options object
         *  New chart options.
         */
        function takeElectricityAndSensorsData(electricity, sensorData, options) {
          chart.electricity = electricity.data;
          chart.summary = electricity.summary;
          chart.sensorData = sensorData ? sensorData.data : [];
          chart.options = options;
        }

        /**
         * Handler for setting chart title.
         * FIXME: Make direct call.
         */
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

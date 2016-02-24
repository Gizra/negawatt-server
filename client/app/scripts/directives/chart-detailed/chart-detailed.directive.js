'use strict';

angular.module('negawattClientApp')
  .directive('chartDetailedTabs', function() {
    return {
      templateUrl: 'scripts/directives/chart-detailed/chart-detailed-tabs.directive.html',
      controller: function ChartDetailedCtrlTabs($scope, $rootScope, Chart, $filter, ApplicationState, ChartUsagePeriod) {

        var ctrlChartTabs = this;

        // Get chart frequencies (in order to draw frequency tabs)
        ctrlChartTabs.frequencies = ChartUsagePeriod.getFrequencies();

        // Handler for click in frequency tab.
        ctrlChartTabs.changeFrequency = function(frequency) {
          // Pass event to appState.
          ApplicationState.frequencyChanged(frequency.type);
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
      controller: function ChartDetailedCtrl($scope, ApplicationState) {
        var chart = this;

        // Expose some functions.
        this.setup = setup;
        this.setChartTitle = setChartTitle;

        // Register in ApplicationState.
        ApplicationState.registerDetailedChart(this);

        /**
         * Setup basic parameters for chart.
         *
         * @param dateRange string
         *  Subtitle for the chart, indicating the date range.
         * @param referenceDate integer
         *  Reference date.
         */
        function setup(dateRange, referenceDate) {
          chart.dateRange = dateRange;
          chart.referenceDate = referenceDate;
        }

        /**
         * Set chart title.
         */
        function setChartTitle(newTitle) {
          chart.title = newTitle;
        }
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

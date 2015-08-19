'use strict';

angular.module('negawattClientApp')
  .directive('chartDetailedTabs', function() {
    return {
      templateUrl: 'scripts/directives/chart-detailed-tabs.directive.html',
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
      },
      templateUrl: 'scripts/directives/chart-detailed-date-selector.directive.html',
      controller: function ChartDetailedDatePickerCtrl($scope, $stateParams, $timeout, Electricity) {

        var ctrlChartDatePicker = this;

        ctrlChartDatePicker.open = function (dateOption) {
          $timeout(function () {
            dateOption.opened = true;
          });
        };

        // Handle change in frequency (
        ctrlChartDatePicker.frequencyChanged = function (chartFreq) {
          ctrlChartDatePicker.chartFreq = chartFreq;
        };

        var now = new Date(),
          dateOptions = {
          1: {
            frequency: 1,
            'datepicker-mode': "'year'",
            'min-mode': "year",
            'format': 'yyyy',
            dt: now.getTime()
          },
          2: {
            frequency: 2,
            'datepicker-mode': "'year'",
            'min-mode': "year",
            'format': 'yyyy',
            dt: now.getTime()
          },
          3: {
            frequency: 3,
            'datepicker-mode': "'month'",
            'min-mode': "month",
            'formatMonth': 'MMM',
            'format': 'MM/yyyy',
            dt: now.getTime()
          },
          4: {
            frequency: 4,
            'starting-day': 1,
            'formatMonth': 'MMM',
            'showWeeks': false,
            'format': 'dd/MM/yy',
            dt: now.getTime()
          },
          5: {
            frequency: 5,
            'starting-day': 1,
            'formatMonth': 'MMM',
            'showWeeks': false,
            'format': 'dd/MM/yy',
            dt: now.getTime()
          }
        };

        ctrlChartDatePicker.refDate = now.getTime();
        ctrlChartDatePicker.minDate = undefined;
        ctrlChartDatePicker.maxDate = undefined;
        ctrlChartDatePicker.dateOptions = dateOptions;
        ctrlChartDatePicker.frequencyChanged($stateParams.chartFreq);

        // Capture change in $stateParams to update chartFreq binding.
        $scope.$on('$locationChangeSuccess', function(event) {
          ctrlChartDatePicker.frequencyChanged($stateParams.chartFreq);
        });

      },
      controllerAs: 'ctrlChartDatePicker'
    }
  })

  .directive('chartDetailed', function () {
    return {
      templateUrl: 'scripts/directives/chart-detailed.directive.html',
      controller: function ChartDetailedCtrl($scope, $window, $stateParams, Chart, $filter, ChartUsagePeriod, ChartElectricityUsage) {
        var chart = this;
        var options;
        var compareCollection;
        var getChartPeriod = ChartUsagePeriod.getChartPeriod;

        /**
         * Electricity Service Event: When electricity collection change update
         * the active electricity (electricity data from a specific period) to
         * usage chart directive.
         */
        $scope.$on("nwElectricityChanged", function(event, electricity) {
          var missingPeriod;

          if (angular.isUndefined(electricity)) {
            return;
          }

          // Save if the period id missing on electricity request, otherwhise false.
          missingPeriod = $filter('activeElectricityFilters')(electricity, 'noData');

          if (!getChartPeriod().isConfigured()) {
            // Configure the period for the chart frequency selected, and request
            // specific electricity data.
            ChartUsagePeriod.config($filter('activeElectricityFilters')(electricity, 'limits'));
          }

          if (missingPeriod && getChartPeriod().isConfigured()) {
            ChartElectricityUsage.requestElectricity(ChartUsagePeriod.stateParams);
            return;
          }

          // Update chart title's date range.
          chart.dateRange = Chart.formatDateRange($stateParams.chartPreviousPeriod * 1000, $stateParams.chartNextPeriod * 1000);

          // Update electricity property with active electricity (if the response has data).
          options = {};
          chart.electricity = $filter('activeElectricityFilters')(electricity);
          chart.data = $filter('toChartDataset')(chart.electricity, compareCollection, options, 'ColumnChart');

          // Update pie chart.
          $scope.chartObject = {
            "type": "PieChart",
            "displayed": true,
            "data": {
              "cols": [
                {
                  "id": "month",
                  "label": "Month",
                  "type": "string",
                  "p": {}
                },
                {
                  "id": "laptop-id",
                  "label": "Laptop",
                  "type": "number",
                  "p": {}
                },
                {
                  "id": "desktop-id",
                  "label": "Desktop",
                  "type": "number",
                  "p": {}
                },
                {
                  "id": "server-id",
                  "label": "Server",
                  "type": "number",
                  "p": {}
                },
                {
                  "id": "cost-id",
                  "label": "Shipping",
                  "type": "number"
                }
              ],
              "rows": [
                {
                  "c": [
                    {
                      "v": "January"
                    },
                    {
                      "v": 19,
                      "f": "42 items"
                    },
                    {
                      "v": 12,
                      "f": "Ony 12 items"
                    },
                    {
                      "v": 7,
                      "f": "7 servers"
                    },
                    {
                      "v": 4
                    },
                    null
                  ]
                },
                {
                  "c": [
                    {
                      "v": "February"
                    },
                    {
                      "v": 13
                    },
                    {
                      "v": 1,
                      "f": "1 unit (Out of stock this month)"
                    },
                    {
                      "v": 0
                    },
                    {
                      "v": 2
                    },
                    null
                  ]
                },
                {
                  "c": [
                    {
                      "v": "March"
                    },
                    {
                      "v": 24
                    },
                    {
                      "v": 5
                    },
                    {
                      "v": 11
                    },
                    {
                      "v": 6
                    },
                    null
                  ]
                }
              ]
            },
            "options": {
              "isStacked": "true",
              "fill": 20,
              "displayExactValues": true,
              "vAxis": {
                "title": "Sales unit",
                "gridlines": {
                  "count": 0
                }
              },
              "hAxis": {
                "title": "Date"
              },
              "tooltip": {
                "isHtml": false
              },
              legend: {position: 'none'},
              backgroundColor: 'none'
            },
            "formatters": {},
            "view": {}
          };

        });

        // Watch window width, and update chart parameters to resize the chart.
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
        compareWith: '=',
        date: '=',
        frequency: '=',
        categories: '=',
        hasExtraChart: '=',
        showExtraChartButton: '@'
      }
    };
  });

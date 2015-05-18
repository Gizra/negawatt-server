'use strict';

angular.module('negawattDirectives', [])
  .directive('chartElectricityUsage', function () {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/directives/chart-electricity-usage.directive.html',
      controller: function(ChartUsage, FilterFactory, $state, $stateParams, $timeout, $urlRouter, $location) {
        var ctrlChart = this;

        // Define default chart data.
        ctrlChart.data = {
          "type": "LineChart",
          "data": {
            "cols": [
              {
                'id': 'month',
                'label': 'Month',
                'type': 'string',
              },
              {
                'id': 'flat',
                'label': 'אחיד',
                'type': 'number',
              },
              {
                'id': 'peak',
                'label': 'פסגה',
                'type': 'number',
              },
              {
                'id': 'mid',
                'label': 'גבע',
                'type': 'number',
              },
              {
                'id': 'low',
                'label': 'שפל',
                'type': 'number',
              }
            ]
          }

          //"displayed": true,
          //"data": {
          //  "cols": [
          //    {
          //      "id": "month",
          //      "label": "Month",
          //      "type": "string",
          //      "p": {}
          //    },
          //    {
          //      "id": "laptop-id",
          //      "label": "Laptop",
          //      "type": "number",
          //      "p": {}
          //    },
          //    {
          //      "id": "desktop-id",
          //      "label": "Desktop",
          //      "type": "number",
          //      "p": {}
          //    },
          //    {
          //      "id": "server-id",
          //      "label": "Server",
          //      "type": "number",
          //      "p": {}
          //    },
          //    {
          //      "id": "cost-id",
          //      "label": "Shipping",
          //      "type": "number"
          //    }
          //  ],
          //  "rows": [
          //    {
          //      "c": [
          //        {
          //          "v": "January"
          //        },
          //        {
          //          "v": 19,
          //          "f": "42 items"
          //        },
          //        {
          //          "v": 12,
          //          "f": "Ony 12 items"
          //        },
          //        {
          //          "v": 7,
          //          "f": "7 servers"
          //        },
          //        {
          //          "v": 4
          //        }
          //      ]
          //    },
          //    {
          //      "c": [
          //        {
          //          "v": "February"
          //        },
          //        {
          //          "v": 13
          //        },
          //        {
          //          "v": 1,
          //          "f": "1 unit (Out of stock this month)"
          //        },
          //        {
          //          "v": 12
          //        },
          //        {
          //          "v": 2
          //        }
          //      ]
          //    },
          //    {
          //      "c": [
          //        {
          //          "v": "March"
          //        },
          //        {
          //          "v": 24
          //        },
          //        {
          //          "v": 5
          //        },
          //        {
          //          "v": 11
          //        },
          //        {
          //          "v": 6
          //        }
          //      ]
          //    }
          //  ]
          //},
          //"options": {
          //  "title": "Sales per month",
          //  "isStacked": "true",
          //  "fill": 20,
          //  "displayExactValues": true,
          //  "vAxis": {
          //    "title": "Sales unit",
          //    "gridlines": {
          //      "count": 10
          //    }
          //  },
          //  "hAxis": {
          //    "title": "Date"
          //  }
          //},
          //"formatters": {}
        };


        // Update data object
        // Get chart frequencies. (Tabs the period of time)
        ctrlChart.frequencies = ChartUsage.get('frequencies');

        /**
         * Change frequency of the chart.
         *
         * @param type
         *  The type of frequency according the period of time selected.
         */
        ctrlChart.changeFrequency = function(type) {
          // Update url with params updated.
          $state.refreshUrlWith({chartFreq: +type});
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

          // Udpate chart.
          updateUsageChart(params);
        }

        /**
         * Return true if we have data to show the request chart on the period
         * parameter, otherwise false.
         */
        ctrlChart.hasData = function hasData() {
          return !!ctrlChart.electricity.length;
        }

        /**
         * Messages to show when there is no data.
         *
         * @type {{empty: string}}
         */
        ctrlChart.messages = {
          empty: ChartUsage.messages.empty
        };

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

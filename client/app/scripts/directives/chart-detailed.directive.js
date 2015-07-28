'use strict';

angular.module('negawattClientApp')
  .directive('chartDetailed', function () {
    return {
      templateUrl: 'scripts/directives/chart-detailed.directive.html',
      controller: function ChartDetailedCtrl($scope, Chart, $filter, ChartUsagePeriod, ChartElectricityUsage, electricityMock) {
        var chart = this;
        var electricity;
        var options;
        var compareCollection;
        var getChartPeriod = ChartUsagePeriod.getChartPeriod;

        // TODO: Calculation of data range with the directive and service of dat range.
        chart.dateRange = chart.date;

        chart.electricity = electricityMock.electricity;
        chart.options =  {
          'isStacked': 'true',
          'fill': 20,
          'displayExactValues': true,
          'height': '200',
          'width': '450',
          'series': {
            0: {targetAxisIndex: 0},
            1: {
              targetAxisIndex: 1,
              type: 'line'
            }
          },
          'vAxes': {
            0: {
              'title': 'Set a title vAxis (Ex. Electricity)',
              'gridlines': {
                'count': 6
              }
            },
            1: {
              'title': 'Set a title vAxis (Ex. Temperature)',
              'gridlines': {
                'count': 6
              },
              'chart_type': 'LineChart',
            }
          },
          'hAxis': {
            'title': 'Set a title hAxis'
          }
        };


        /**
         * Electricity Service Event: When electricity collection change update
         * the active electricity (electricity data from a specific period) to
         * usage chart directive.
         */
        $scope.$on("nwElectricityChanged", function(event, electricity) {
          //var missingPeriod;
          //
          //electricity = electricityMock.electricity;
          //
          //if (angular.isUndefined(electricity)) {
          //  return;
          //}

          //// Save if the period id missing on electricity request, otherwhise false.
          //missingPeriod = $filter('activeElectricityFilters')(electricity, 'noData');
          //
          //if (!getChartPeriod().isConfigured()) {
          //  // Configure the period for the chart frequency selected, and request
          //  // specific electricity data.
          //  ChartUsagePeriod.config($filter('activeElectricityFilters')(electricity, 'limits'));
          //}
          //
          //if (missingPeriod && getChartPeriod().isConfigured()) {
          //  ChartElectricityUsage.requestElectricity(ChartUsagePeriod.stateParams);
          //  return;
          //}

          // Update electricity property with active electricity (if the response has data).
          //chart.electricity = $filter('activeElectricityFilters')(electricity);
          //chart.electricity = $filter('toChartDataset')(chart.electricity, compareCollection, options, 'ColumnChart');




        });


      },
      controllerAs: 'chart',
      bindToController: true,
      scope: {
        compareWith: '=',
        date: '=',
        frequency: '=',
        categories: '=',
        hasExtraChart: '=',
        showExtraChartButton: '@'
      }
    };
  });

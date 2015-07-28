'use strict';

angular.module('negawattClientApp')
  .directive('chartDetailed', function () {
    return {
      templateUrl: 'scripts/directives/chart-detailed.directive.html',
      controller: function ChartDetailedCtrl($scope, electricityMock) {
        var chart = this;
        var electricity;
        var options;
        var compareCollection;

        chart.getData = getData;
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
         * Get chart dataset with options.
         */
        function getData() {
          console.log('getData');
        }

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

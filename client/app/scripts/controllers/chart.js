'use strict';

angular.module('negawattClientApp')
  .controller('BigChartCtrl', function($scope, $filter, Chart, Electricity, electricityMock) {
    var vm = this;

    var options = {
      'isStacked': 'true',
      'fill': 20,
      'displayExactValues': true,
      'height': '500',
      'width': '768',
      'series': {
        //4: {type: 'line'}
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

    var electricity = electricityMock.electricity;
    // Mock active frequency.
    Chart.setActiveFrequency(2);

    vm.dataset = $filter('toChartDataset')(electricity, options, 'ColumnChart');
    console.log(vm.dataset);
  });

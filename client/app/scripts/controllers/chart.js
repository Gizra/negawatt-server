'use strict';

angular.module('negawattClientApp')
  .controller('BigChartCtrl', function($scope, $filter, Chart, Electricity, electricityMock) {
    var vm = this;

    var options = {
      'height': '500',
      'width': '768',
      'series': {
        0: {targetAxisIndex: 0},
        1: {targetAxisIndex: 1}
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
          }
        }
      },
      'hAxis': {
        'title': 'Set a title hAxis'
      }
    };

    var electricity = electricityMock;
    // Mock active frequency.
    Chart.setActiveFrequency(2);

    vm.dataset = $filter('toChartDataset')(electricity, options)
  });

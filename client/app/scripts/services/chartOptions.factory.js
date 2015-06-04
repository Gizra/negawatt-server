'use strict';

angular.module('negawattClientApp')
  .factory('ChartOptions', function () {
    var extend = angular.extend;
    var commonOptions = {
      'isStacked': 'true',
      'fill': 20,
      'displayExactValues': true,
      'vAxis': {
        'title': 'Set a title vAxis',
        'gridlines': {
          'count': 6
        }
      },
      'hAxis': {
        'title': 'Set a title hAxis'
      }
    };

    return {
      'ColumnChart': extend(commonOptions, {'bar': { groupWidth: '75%' }}),
      'LineChart': commonOptions
    }
  });

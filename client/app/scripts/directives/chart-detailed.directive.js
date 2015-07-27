'use strict';

angular.module('negawattClientApp')
  .directive('chartDetailed', function () {
    return {
      templateUrl: 'scripts/directives/chart-detailed.directive.html',
      controller: function ChartDetailedCtrl() {
        var chart = this;

        // TODO: Calculation of data range with the directive and service of dat range.
        chart.dateRange = chart.date;

      },
      controllerAs: 'chart',
      bindToController: true,
      scope: {
        electricity: '=',
        compareWith: '=',
        date: '=',
        frequency: '=',
        categories: '=',
        comparing: '=',
        showComparation: '@'
      }
    };
  });

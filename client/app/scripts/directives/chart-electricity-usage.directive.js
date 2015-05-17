'use strict';

angular.module('negawattDirectives', [])
  .directive('chartElectricityUsage', function () {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/directives/chart-electricity-usage.directive.html',
      controller: function() {
        var chart = this;

        chart.title = 'Chart Electricity Usage';
      },
      controllerAs: 'ctrlChart',
      bindToController: true,
      // Isolate scope.
      scope: {
        account: '='
      }
    };
  });

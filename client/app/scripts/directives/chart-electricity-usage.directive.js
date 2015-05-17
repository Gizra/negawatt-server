'use strict';

angular.module('negawattDirectives', [])
  .directive('chartElectricityUsage', function () {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/directives/chart-electricity-usage.directive.html',
      controller: function(Chart) {
        var chartCtrl = this;
        
        // Get chart frequencies. (Tabs the period of time)
        chartCtrl.frequencies = Chart.get('frequencies');

        /**
         * Change frequency of the chart.
         *
         * @param type
         */
        chartCtrl.changeFrequency = function(type) {

        }
      },
      controllerAs: 'ctrlChart',
      bindToController: true,
      // Isolate scope.
      scope: {
        account: '='
      }
    };
  });

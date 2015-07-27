'use strict';

angular.module('negawattClientApp')
  .directive('chartDetailed', function () {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/directives/chart-detailed.directive.html',
      controller: function chartDetailedCtrl($filter, $scope) {

      },
      scope: {
        chart: '='
      }
    };
  });

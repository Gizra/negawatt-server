'use strict';

angular.module('negawattClientApp')
  .directive('chartDetailed', function () {
    return {
      templateUrl: 'scripts/directives/chart-detailed.directive.html',
      controller: function chartDetailedCtrl() {
        
      },
      controllerAs: 'chart-detailed',
      bindToController: true,
      scope: {
        electricity: '=',
        compareWith: '=',
        date: '=',
        frequency: '='
      }
    };
  });

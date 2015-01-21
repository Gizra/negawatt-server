'use strict';

/**
 * @ngdoc directive
 * @name negawattClientApp.directive:loadingBarText
 * @description
 * # loadingBarText
 */
angular.module('negawattClientApp')
  .directive('loadingBarText', function () {
    return {
      restrict: 'EA',
      template: '<div class="splash-screen" ng-show="isLoading">{{text}}</div>',
      controller: function($scope) {
        $scope.text = 'טוען...';
        $scope.isLoading = false;

        /**
         * Determine if the text is showing.
         *
         * @param isLoading - Boolean
         *  True show the text, false hide it.
         */
        function setLoading(isLoading) {
          $scope.isLoading = isLoading;
        }

        // Events to set the message when start the XHR request until is completed.
        $scope.$on('cfpLoadingBar:started', function() {
          setLoading(true);
        });

        $scope.$on('cfpLoadingBar:completed', function() {
          setLoading(false);
        });
      },
      // Isolate scope.
      scope: {}
    };
  });

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
      link: function postLink(scope, element) {
        element.prepend('<div class=\"splash-screen\">טוען...</div>');
      }
    };
  });

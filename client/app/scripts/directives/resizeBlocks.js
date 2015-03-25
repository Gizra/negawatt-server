'use strict';

/**
 * @ngdoc directive
 * @name negawattClientApp.directive:resizeBlocks
 * @description
 *    Resize display blocks to let usage-chart block be of a given height.
 */
angular.module('negawattClientApp')
  .directive('resizeBlocks', function () {

    /**
     * Resize the blocks.
     *
     * @param isLoading - Boolean
     *  True show the text, false hide it.
     */
    function resizeBlocks(newHeight) {

      // Calculate new width and height.
      var newWidth = newHeight * 510 / 220;
      var newBottom = newHeight + 15;

      // Set elements.
      var element = angular.element('ui-view[name="messages"]');
      element.css('bottom', newBottom + 'px');

      element = angular.element('ui-view[name="details"]');
      element.css('bottom', newBottom + 'px');
      var detailsHeight = +element.css('height').replace('px', '');

      element = angular.element('ui-view[name="categories"]');
      element.css('bottom', newBottom + detailsHeight + 5 + 'px');

      element = angular.element('ui-view[name="usage"]');
      element.css('height', newHeight + 'px');
      element.css('width', newWidth + 'px');

      element = angular.element('#chart-usage');
      element.css('height', newHeight + 'px');
      element.css('width', newWidth + 'px');
    }

    /**
     * Link function, install a watcher.
     *
     * @param isLoading - Boolean
     *  True show the text, false hide it.
     */
    function link(scope) {
      scope.$on('$locationChangeSuccess', function (event, newLocation) {
        var match = /chartHeight=(\d+)/.exec(newLocation);
        if (!match || match.length < 2) {
          return;
        }
        var height = match[1];
        resizeBlocks(+height);
      });
    }

    return {
      link: link
    };
  });

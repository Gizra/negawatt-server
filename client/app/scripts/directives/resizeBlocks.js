'use strict';

/**
 * @ngdoc directive
 * @name negawattClientApp.directive:resizeBlocks
 * @description
 *    Resize display blocks to let usage-chart block be of a given height.
 */
angular.module('negawattClientApp')
  .directive('resizeBlocks', function () {

    function link(scope, element, attrs) {

      /**
       * Resize the blocks.
       *
       * @param isLoading - Boolean
       *  True show the text, false hide it.
       */
      function resizeBlocks(chartHeight) {
        // Set block size, to fit given chartHeight.
        var newHeight = chartHeight;

        // Calculate new width and height.
        var newWidth = newHeight * 510 / 220;
        var newBottom = newHeight + 15;

        // Set elements.
        var element = angular.element('ui-view[name="messages"]');//angular.element('#messages-view');
        element.css('bottom', newBottom + 'px');

        element = angular.element('ui-view[name="details"]');//angular.element('#details-view');
        element.css('bottom', newBottom + 'px');
        var detailsHeight = +element.css('height').replace('px', '');

        element = angular.element('ui-view[name="categories"]');//angular.element('#catigories-view');
        element.css('bottom', newBottom + detailsHeight + 5 + 'px');

        element = angular.element('ui-view[name="usage"]');//angular.element('#usage-view');
        element.css('height', newHeight + 'px');
        element.css('width', newWidth + 'px');
      };

      resizeBlocks(+attrs.resizeBlocks);
    }

    return {
      link: link
    };
  });

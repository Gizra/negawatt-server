'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.decorator:leafletHelpers
 * @description
 * #
 * Add new helpers to support Leaflet Plugins.
 *   - MazeMap/Leaflet.ControlledBounds Plugin
 */

angular.module('negawattClientApp')
  .config(function ($provide) {
    var extend = angular.extend;

    $provide.decorator('leafletHelpers', function($delegate) {
      var plugin = {
        LeafletActiveAreaPlugin: {
          isLoaded: function() {
            return angular.isDefined(L.Map.prototype.setActiveArea);
          }
        }
      };

      extend($delegate, plugin);
      return $delegate;
    });

});

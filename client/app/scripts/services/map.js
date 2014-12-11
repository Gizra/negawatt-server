'use strict';

angular.module('negawattClientApp')
  .service('Map', function (leafletData) {
    var Map = this;

    // Initial center point.
    var center =  {
      lat: 31.6047,
      lng: 34.7749,
      zoom: 15,
      autoDiscover: false
    };

    /**
     * Return extra configuration for the maps.
     *
     * @returns {*}
     *  Maps Default configuration object.
     */
    this.getConfig = function() {
      return {
        zoomControlPosition: 'bottomleft'
      }
    };

    /**
     * Return of the geolocation values of the center of the map.
     */
    this.getCenter = function() {
      return center;
    };

    /**
     * Center the map by the marker.
     *
     * @param marker
     *   Marker object.
     */
    this.centerMapByMarker = function(marker) {
      leafletData.getMap().then(function(map){
        map.setView(marker.getPosition())
      });
    }

  });

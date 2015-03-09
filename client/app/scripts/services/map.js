'use strict';

angular.module('negawattClientApp')
  .service('Map', function ($rootScope, leafletData) {
    var self = this;

    // Initial center point.
    var cache = {};

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwMapChanged';

    /**
     * Return extra configuration for the maps.
     *
     * @returns {*}
     *  Maps Default configuration object.
     */
    this.getConfig = function() {
      return {
        tileLayer: 'https://{s}.tiles.mapbox.com/v3/examples.map-i87786ca/{z}/{x}/{y}.png',
        zoomControlPosition: 'bottomleft',
        minZoom: 8,
        maxZoom:16
      };
    };

    /**
     * Set geolocation values of the center of the map.
     *
     * @param center
     *  Center object format for leaftlet map {lat, long, center}.
     */
    this.setCenter = function(center) {
      cache.center = angular.extend(cache.center || {}, center);
      $rootScope.$broadcast(broadcastUpdateEventName);
    };

    /**
     * Update the zoom value in the center object.
     *
     * @param zoom int
     *  Value of the zoom expressed an integer.
     */
    this.updateCenterZoom = function(zoom) {
      if (angular.isDefined(cache.center)) {
        cache.center.zoom = zoom;
      }
    };

    /**
     * Return of the geolocation values of the center of the map.
     *
     * @param account {*}
     *  Account object with the initial center
     * @return center
     *   Center object.
     */
    this.getCenter = function(account) {

      if (angular.isUndefined(cache.center) && angular.isDefined(account.center)) {
        self.setCenter(account.center);
      }

      // angular.copy keep the cache as private property.
      return angular.copy(cache.center);

    };

    /**
     * Center the map by the marker.
     *
     * @param marker
     *   Marker object.
     */
    this.centerMapByMarker = function(marker) {
      leafletData.getMap().then(function(map){
        // Save the new center.
        self.setCenter(marker.getPosition());

        // Set the new position position.
        map.setView(self.getCenter());
      });
    };

    /**
     * Save the selected marker.
     *
     * @param marker
     *  The marker ID.
     */
    this.setMarkerSelected = function(marker) {
      cache.markerSelected = marker;
    };

    /**
     * Return the selected marker.
     *
     * @returns int
     *  The marker ID.
     */
    this.getMarkerSelected = function() {
      return cache.markerSelected;
    };

    $rootScope.$on('nwClearCache', function() {
      cache = {};
    });

  });

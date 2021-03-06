'use strict';

angular.module('negawattClientApp')
  .service('Map', function ($rootScope, $log, leafletData, leafletHelpers, Config) {
    var self = this;

    // Initial center point.
    var cache = {};

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwMapChanged';

    var maxBounds = {};

    // Check if extra plugins are installed.
    if (!leafletHelpers.LeafletActiveAreaPlugin.isLoaded()) {
      $log.error('[AngularJS - Leaflet] The Leaflet-active-area is not loaded.');
    }

    /**
     * Return value of the max bounds for the actual map.
     *
     * @returns {{}}
     */
    this.getMaxBounds = function() {
      return maxBounds;
    };

    /**
     * Return extra configuration for the maps.
     *
     * @returns {*}
     *  Maps Default configuration object.
     */
    this.getConfig = function() {
      return {
        tileLayer: 'http://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
        tileLayerOptions: Config.tileLayerOptions,
        zoomControlPosition: 'bottomleft',
        minZoom: 12,
        maxZoom:19,
        maxNativeZoom: null,
        fadeAnimation: false,
        zoomAnimation: false,
        markerZoomAnimation: false
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

    /**
     * Global Event to clear cache data.
     */
    $rootScope.$on('nwClearCache', function() {
      cache = {};
    });

    /**
     * Map Event Load
     *
     * - Update max bound of the map, according the center value.
     */
    $rootScope.$on('leafletDirectiveMap.load', function(event, members) {
      if (angular.isDefined(members.model.maxbounds)) {
        return;
      }

      // Set initial max boundaries.
      getActualBounds().then(function() {
        //members.model.maxbounds = self.getMaxBounds();
      })
      event.preventDefault();
    });

    /**
     * Return promise with actual bounds of the map.
     *
     * When promise is resolved update a private  maxBound variable.
     *
     * @returns {*}
     *  A Promise $q
     */
    function getActualBounds() {

      return leafletData.getMap().then(function(map) {
        var bounds;
        // Force create boundaries with less zoom.
        bounds = map.getBounds().pad(1.2);
        maxBounds = {
          northEast: bounds._northEast,
          southWest: bounds._southWest
        };

      })
    }


  });

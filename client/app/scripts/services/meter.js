'use strict';

angular.module('negawattClientApp')
  .service('Meter', function ($q, $http, $timeout, $filter, $state, $rootScope, Config, Marker, Utils) {

    // A private cache key.
    var cache = {};

    // Handle when reset the cache, this need it to handle multiple pagination data.
    var skipResetCache = false;

    /**
     * Return a promise with the meter list, from cache or the server.
     *
     * @param categoryId
     *  The category ID.
     *
     * @returns {Promise}
     *
     */
    this.get = function(categoryId) {
      var gettingMeters = $q.when(cache.data || getDataFromBackend());

      // Filtering in the case we have categoryId defined.
      if (angular.isDefined(categoryId)) {
        gettingMeters = gettingMetersFilterByCategory(gettingMeters, categoryId);
      }

      return gettingMeters;
    };

    /**
     * Return meters array from the server.
     *
     * @param pageNumber
     *    The url for the next list (page) of meters.
     *
     * @returns {$q.promise}
     */
    function getDataFromBackend(pageNumber) {
      var deferred = $q.defer();
      var url;
      pageNumber = pageNumber || 1;

      // Define endpoint.
      url = Config.backend + '/api/iec_meters?page=' + pageNumber;

      $http({
        method: 'GET',
        url: url,
        transformResponse: prepareMetersForLeafletMarkers
      }).success(function(meters) {
        setCache(meters.data);
        deferred.resolve(cache.data);

        // Update with the rest of the markers.
        if (meters.hasNextPage) {
          skipResetCache = true;
          getDataFromBackend(getPageNumber(meters.hasNextPage.href));
        }

        resetCache();
      });

      return deferred.promise;
    }

    /**
     * Save meters in cache, and broadcast en event to inform that the meters data changed.
     *
     * @param data
     *    The meter list.
     */
    function setCache(data) {
      // Extend meters list.
      cache = {
        data: angular.extend(cache.data || {}, data),
        timestamp: new Date()
      };

      // Broadcast and event to update the markers in the map.
      $rootScope.$broadcast('negawattMetersChanged');

      // Active the reset after update the cache.
      skipResetCache = false;
    }

    /**
     * Reset the meters in the cache.
     */
    function resetCache() {
      if (skipResetCache) {
        return;
      }

      // Clear cache in 10 minutes.
      $timeout(function() {
        cache.data = undefined;
      }, 600000);
    }

    /**
     * Convert the array of list of meters to and object of meters.
     *
     * Also prepare the lang and lat values so Leaflet can pick them up.
     *
     * @param response []
     *   Response List of meters in an array.
     *
     * @returns {*}
     *   List of meters organized in an object, each meter it's a property keyed
     *   by the id.
     */
    function prepareMetersForLeafletMarkers(response) {
      var meters = {};

      // Unserialize the response.
      response = angular.fromJson(response);

      // Save meters and the next request to get hasNextPage meters (if exist).
      meters = {
        data: response.data,
        hasNextPage: response.next || false
      };

      angular.forEach(meters.data, function(item) {
        meters.data[item.id] = item;

        // Convert the geo location properties as expected by leaflet map.
        if (item.location) {
          meters.data[item.id].lat = parseFloat(item.location.lat);
          meters.data[item.id].lng = parseFloat(item.location.lng);

          delete item.location;
        }

        // Set meter tooltip
        meters.data[item.id].message = item.place_description + '<br>' + item.place_address + '<br>' + item.place_locality;

        // Extend meter with marker properties and methods.
        angular.extend(meters.data[item.id], Marker);
        // Define default icon properties and methods, in order, to be changed later.
        meters.data[item.id].unselect();
      });

      return meters;
    }

    /**
     * Return a promise with the meter list, from cache or the server. Filter by a category.
     *
     * @param gettingMeter - {$q.promise}
     *    Promise with the list of meters.
     *
     * @param categoryId
     *    The category ID.
     *
     * @returns {$q.promise}
     *    Promise of a list of meters filter by category..
     */
    function gettingMetersFilterByCategory(gettingMeter, categoryId) {
      var deferred = $q.defer();

      // Filter meters with a category.
      gettingMeter.then(function(meters) {
        meters = Utils.indexById($filter('filter')(Utils.toArray(meters), {meter_categories: categoryId}, true));
        deferred.resolve(meters);
      });

      return deferred.promise;
    }

    /**
     * Return the number page from the url.
     *
     * @param url
     *    The url of the next page.
     */
    function getPageNumber(url) {
      var regex = /.*page=([0-9]*)/;

      return regex.exec(url).pop();
    }


  });

'use strict';

angular.module('negawattClientApp')
  .service('Meter', function ($q, $http, $timeout, $filter, $state, $rootScope, Config, Marker, Utils) {
    var self = this;

    // A private cache key.
    var cache = {};

    // Handle when reset the cache, this need it to handle multiple pagination data.
    var skipResetCache = false;

    // Force to only execute one request
    var getMeters;

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwMetersChanged';

    /**
     * Return a promise with the meter list, from cache or the server.
     *
     * @param accountId
     *  The account ID.
     * @param categoryId
     *  The category ID.
     *
     * @returns {Promise}
     *
     */
    this.get = function(accountId, categoryId) {
      // We return the promise in progress, cache data or data from the server.
      getMeters = $q.when(getMeters || angular.copy(cache.data) || getDataFromBackend(accountId));

      // Filtering in the case we have categoryId defined.
      if (angular.isDefined(categoryId)) {
        getMeters = getMetersFilterByCategory(getMeters, categoryId);
      }

      // Clear the promise cached, after resolve or reject the promise. Permit access to the cache data, when
      // the promise excecution is done (finally).
      getMeters.finally(function getMeterFinally() {
        getMeters = undefined;
      });

      return getMeters;
    };

    /**
     * Return meters array from the server.
     *
     * @param accountId
     *  The account ID.
     * @param pageNumber
     *  The url for the next list (page) of meters.
     *
     * @returns {$q.promise}
     */
    function getDataFromBackend(accountId, pageNumber) {
      var deferred = $q.defer();
      var url;
      pageNumber = pageNumber || 1;

      // Define endpoint.
      url = Config.backend + '/api/meters?filter[account]=' + accountId + '&page=' + pageNumber;

      $http({
        method: 'GET',
        url: url,
        transformResponse: prepareMetersForLeafletMarkers
      }).success(function(meters) {
        setCache(meters.data);
        deferred.resolve(meters.data);

        // Update with the rest of the markers.
        if (meters.hasNextPage) {
          skipResetCache = true;
          getDataFromBackend(accountId, getPageNumber(meters.hasNextPage.href));
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
      $rootScope.$broadcast(broadcastUpdateEventName, cache.data);

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
      $timeout(function timeoutResetCache() {
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
        data: Utils.indexById(response.data),
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
     * @param getMeters - {$q.promise}
     *    Promise with the list of meters.
     *
     * @param categoryId
     *    The category ID.
     *
     * @returns {$q.promise}
     *    Promise of a list of meters filter by category..
     */
    function getMetersFilterByCategory(getMeters, categoryId) {
      var deferred = $q.defer();

      // Filter meters with a category.
      getMeters.then(function(meters) {
        meters = Utils.indexById($filter('filter')(Utils.toArray(meters), function(meter) {

          // Convert categories id to integer.
          if (meter.meter_categories) {
            meter.meter_categories = meter.meter_categories.map(function(item) { return parseInt(item)});
          }

          if (meter.meter_categories && meter.meter_categories.indexOf(parseInt(categoryId)) !== -1) {
            return meter;
          }
        }, true));

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

    $rootScope.$on('nwClearCache', function() {
      cache = {};
    });
  });

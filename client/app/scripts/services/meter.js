'use strict';

angular.module('negawattClientApp')
  .service('Meter', function ($q, $http, $timeout, $rootScope, Config, Marker, Utils, MeterFilter) {
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
      // We return the promise in progress, cache data filtered or data from the server.
      getMeters = $q.when(getMeters || metersFiltered() || getDataFromBackend(accountId));

      // Filtering in the case we have categoryId defined.
      if (angular.isDefined(categoryId)) {
        MeterFilter.filters.category = categoryId;
      }

      // Clear the promise cached, after resolve or reject the promise. Permit access to the cache data, when
      // the promise excecution is done (finally).
      getMeters.finally(function getMeterFinally() {
        getMeters = undefined;
      });

      return getMeters;
    };

    /**
     * Broadcast a notification of the meter data and it filters had changed.
     */
    this.refresh = function() {
      // Broadcast and event to update the markers in the map.
      $rootScope.$broadcast(broadcastUpdateEventName, metersFiltered());
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

      // Define endpoint with filters.
      // Get only meters that has electricity data.
      url = Config.backend + '/api/meters?'
        + 'filter[has_electricity]=1'
        + '&filter[account]=' + accountId
        + '&page=' + pageNumber;

      $http({
        method: 'GET',
        url: url,
        transformResponse: prepareMetersForLeafletMarkers
      }).success(function(meters) {
        setCache(meters.data);

        // Resolve with the meters filtered from cache.data.
        deferred.resolve(metersFiltered());

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
      if (angular.isUndefined(cache.data)) {
        cache.data = {
          // Save all the meters during the cache are avalible.
          listAll: {},
          // Keep the actual collection filtered, used to show into the map.
          list: {},
          // Interval information for electricity chart.
          total: {}
        };
      }

      // Extend meters properties explicit because we don have deep copy.
      // TODO: from angular v1.4 use angular.merge().
      angular.extend(cache.data.listAll, data.list);
      angular.extend(cache.data.total, data.total);
      cache.timestamp = new Date();

      // Broadcast and event to update the markers in the map.
      $rootScope.$broadcast(broadcastUpdateEventName, metersFiltered());

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
        data: {
          list: Utils.indexById(response.data)
        },
        hasNextPage: response.next || false
      };

      angular.forEach(meters.data.list, function(item) {
        meters.data.list[item.id] = item;

        // Convert the geo location properties as expected by leaflet map.
        if (item.location) {
          meters.data.list[item.id].lat = parseFloat(item.location.lat);
          meters.data.list[item.id].lng = parseFloat(item.location.lng);

          delete item.location;
        }

        // Set meter tooltip
        meters.data.list[item.id].message = item.place_description + '<br>' + item.place_address + '<br>' + item.place_locality;

        // Extend meter with marker properties and methods.
        angular.extend(meters.data.list[item.id], Marker);

        // Define default icon properties and methods, in order, to be changed later.
        meters.data.list[item.id].unselect();
      });

      // Add total property inside the meter data object, as private property.
      meters.data.total = response.total;

      return meters;
    }

    /**
     * Return meters filter by the active filters.
     *
     * @returns {*|cache.data|{list, total}}
     */
    function metersFiltered() {
      if (angular.isDefined(cache.data)) {
        cache.data.list = MeterFilter.byCategory(cache.data);
      }
      return cache.data;
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

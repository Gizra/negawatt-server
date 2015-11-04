'use strict';

angular.module('negawattClientApp')
  .service('Temperature', function Temperature($q, $http, $timeout, $rootScope, Config, Utils, FilterFactory) {
    var self = this;

    // A private cache key.
    var cache = {};
    this.__cache = cache;

    // Array of $timeout promises to clear the cache.
    var timeouts = [];

    var getTemperature = {};

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwTemperatureChanged';

    /**
     * Get temperature data.
     *
     * Returns a promise for temperature data, from cache or the server.
     *
     * @param hash
     *   String that represent the filter parameters in GET params format.
     *
     * @returns {*}
     *   A promise to temperature data.
     */
    this.get = function(hash) {
      if (angular.isUndefined(hash)) {
        // 'Negawatt.Temperature - Hash not defined on method get(hash)';
        // Return a promise to empty data.
        return $q.when({});
      }

      // Preparation of the promise and cache for Temperature request.
      getTemperature[hash] = $q.when(getTemperature[hash] || temperatureRecords(hash) || getDataFromBackend(hash, 1, false));

      // Clear the promise cached, after resolve or reject the
      // promise. Permit access to the cache data, when
      // the promise execution is done (finally).
      getTemperature[hash].finally(function getTemperatureFinally() {
        getTemperature[hash] = undefined;
      });

      return getTemperature[hash];
    };

    /**
     * Return temperature data array from the server.
     *
     * @param hash
     *
     * @param pageNumber
     * @param skipResetCache
     * @returns {$q.promise}
     */
    function getDataFromBackend(hash, pageNumber, skipResetCache) {
      var deferred = $q.defer();
      var url = Config.backend + '/api/climate';
      // Create a copy of filters, since params might add page option. Filters must
      // stay clean of page parameters since it also serves as key to the cache.
      var params = FilterFactory.getTemperature(hash) || {};

        // If page-number is given, add it to the params.
      // Don't modify 'filters' since it should reflect the general params,
      // without page number.
      if (pageNumber) {
        params['page'] = pageNumber;
      }

      $http({
        method: 'GET',
        url: url,
        params: params
      }).success(function(temperature, status, headers, config) {
        var noData = angular.isDefined(config.params.nodata);
        var hasNextPage = temperature.next != undefined;

        setCache(temperature, hash, skipResetCache, noData);

        deferred.resolve(temperatureRecords(hash));

        // If there are more pages, read them.
        if (hasNextPage && !noData) {
          getDataFromBackend(hash, pageNumber + 1, true);
        }
      });

      return deferred.promise;
    }

    /**
     * Save data in cache, and broadcast an event to inform that the temperature data changed.
     *
     * @param temperature
     *   The data to cache.
     * @param hash
     *   A hash for the cached data - the hash code of the filters.
     * @param skipResetCache
     *   If false, a timer will be set to clear the cache in 60 sec.
     */
    function setCache(temperature, hash, skipResetCache) {
      // Cache messages data.
      cache[hash] = {
        data: (cache[hash] ? cache[hash].data : []).concat(temperature.data)
      };

      // Broadcast an update event.
      $rootScope.$broadcast(broadcastUpdateEventName, temperatureRecords(hash));

      // If asked to skip cache timer reset, return now.
      // Will happen when reading multiple page data - when reading pages
      // other then the first, there's no need to start a new timer to
      // reset the cache.
      if (skipResetCache) {
        return;
      }

      // Clear cache in 30 minutes.
      timeouts.push($timeout(function() {
        if (angular.isDefined(cache[hash])) {
          cache[hash] = undefined;
        }
      }, 1800000));
    }

    // Event handler for cache clear.
    $rootScope.$on('nwClearCache', function() {
      cache = {};

      // Cancel Promises of timeout to clear the cache.
      angular.forEach(timeouts, function(timeout) {
        $timeout.cancel(timeout);
      });

      // Destroy pile of timeouts.
      timeouts = [];
    });

    /**
     * Return a object of temperature record.
     *
     * @param hash
     *  Hash string that reprsente the filters and the result of the query
     * @returns {*}
     */
    function temperatureRecords(hash) {
      return (angular.isUndefined(hash)) ? cache : cache[hash] && cache[hash].data;
    }
  });


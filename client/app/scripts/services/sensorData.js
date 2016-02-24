'use strict';

angular.module('negawattClientApp')
  .service('SensorData', function SensorData($q, $http, $timeout, $rootScope, Config, Utils, FilterFactory) {
    // A private cache key.
    var cache = {};

    // Array of $timeout promises to clear the cache.
    var timeouts = [];

    var getSensorData = {};

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwSensorDataChanged';


    /**
     * Get sensorData data.
     *
     * Returns a promise for sensorData data, from cache or the server.
     *
     * @param cleanParams
     *   Array of filter parameters in GET params format.
     *
     * @returns {*}
     *   A promise to sensorData data.
     */
    this.get = function(cleanParams) {
      // Create a copy of the original params, since 'page' option might be added.
      var params = angular.copy(cleanParams);

      // Get a unique hash key for the given params.
      var hash = Utils.objToHash(params);

      // Preparation of the promise and cache for SensorData request.
      getSensorData[hash] = $q.when(getSensorData[hash] || sensorDataData(hash) || getDataFromBackend(params, hash, 1, false));

      // Clear the promise cached, after resolve or reject the
      // promise. Permit access to the cache data, when
      // the promise execution is done (finally).
      getSensorData[hash].finally(function getSensorDataFinally() {
        getSensorData[hash] = undefined;
      });

      return getSensorData[hash];
    };

    /**
     * Return sensorData data array from the server.
     *
     * @param params array
     *  An array of filter parameters for the HTTP request.
     * @param hash
     *  A hash code for the query (derived from params).
     * @param pageNumber integer
     *  Optional page number to add to the params array.
     * @param skipResetCache boolean
     *  True if we DON'T want the cache to be cleared in 30 mins.
     *
     * @returns {$q.promise}
     *  A promise to get the data.
     */
    function getDataFromBackend(params, hash, pageNumber, skipResetCache) {
      var deferred = $q.defer();
      var url = Config.backend + '/api/sensor_data';

      // If page-number is given, add it to the params.
      if (pageNumber) {
        params['page'] = pageNumber;
      }

      $http({
        method: 'GET',
        url: url,
        params: params
      }).success(function(sensorData, status, headers, config) {
        var noData = angular.isDefined(config.params.nodata);
        var hasNextPage = sensorData.next != undefined;

        setCache(sensorData, hash, skipResetCache, noData, pageNumber);

        deferred.resolve(sensorDataData(hash));

        // If there are more pages, read them recursively.
        if (hasNextPage && !noData) {
          getDataFromBackend(params, hash, pageNumber + 1, true);
        }
      });

      return deferred.promise;
    }

    /**
     * Save data in cache, and broadcast an event to inform that the sensorData data changed.
     *
     * @param sensorData
     *   The data to cache.
     * @param hash
     *   A key for the cached data - the hash code of the filters.
     * @param skipResetCache
     *   If false, a timer will be set to clear the cache in 60 sec.
     * @param noData
     *   True if parameter noData is 1, otherwise is false.
     * @param pageNumber
     *   Number of current data-page in multiple pages download.
     */
    function setCache(sensorData, hash, skipResetCache, noData, pageNumber) {
      // Cache messages data.
      cache[hash] = {
        data: (cache[hash] ? cache[hash].data : []).concat(sensorData.data),
        limits: sensorData.summary.timestamp,        
        timestamp: new Date(),
        noData: noData,
        summary: sensorData.summary,
        pageNumber: pageNumber
      };

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
     * Return a object of sensorData record.
     *
     * @param hash
     *  Hash string that reprsente the filters and the result of the query
     * @returns {*}
     */
    function sensorDataData(hash) {
      var data = angular.isUndefined(hash) ? cache : cache[hash];
      if (data) {
        // Data was found, broadcast an update event.
        // FIXME: Is this the right place to broadcast the event? Maybe put in setCache.
        $rootScope.$broadcast(broadcastUpdateEventName, data);
      }
      return data;
    }
  });


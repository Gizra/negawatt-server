'use strict';

angular.module('negawattClientApp')
  .service('Electricity', function Electricity($q, $http, $timeout, $rootScope, Config, Utils, FilterFactory) {
    var self = this;

    // A private cache key.
    var cache = {};
    this.__cache = cache;

    // Array of $timeout promises to clear the cache.
    var timeouts = [];

    var getElectricity = {};

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwElectricityChanged';

    /**
     * Get electricity data.
     *
     * Returns a promise for electricity data, from cache or the server.
     *
     * @param hash
     *   String that represent the filter parameters in GET params format.
     *
     * @returns {*}
     *   A promise to electricity data.
     */
    this.get = function(hash) {
      if (angular.isUndefined(hash)) {
        return undefined;
      }

      // Preparation of the promise and cache for Electricity request.
      getElectricity[hash] = $q.when(getElectricity[hash] || electricityRecords(hash) || getDataFromBackend(hash, 1, false));

      // Clear the promise cached, after resolve or reject the
      // promise. Permit access to the cache data, when
      // the promise execution is done (finally).
      getElectricity[hash].finally(function getElectricityFinally() {
        getElectricity[hash] = undefined;
      });

      return getElectricity[hash];
    };

    /**
     * Brodcast event to refresh the electricity object in the $scope.
     *
     * @param hash
     *  Hash string for the data to be updated.
     */
    this.refresh = function(hash) {
      // Initial electricity data force.
      angular.isUndefined(cache[hash]) && self.get(hash);

      // Broadcast an update event.
      angular.isDefined(cache[hash]) && $rootScope.$broadcast(broadcastUpdateEventName, electricityRecords());
    };

    /**
     * Force the lazyload of the electricity data.
     *
     * @param hash
     */
    this.forceResolve = function(hash) {
      // Initial electricity data force.
      angular.isUndefined(cache[hash]) && self.get(hash);
    }

    /**
     * Return electricity data array from the server.
     *
     * @param hash
     *
     * @param pageNumber
     * @param skipResetCache
     * @returns {$q.promise}
     */
    function getDataFromBackend(hash, pageNumber, skipResetCache) {
      var deferred = $q.defer();
      var url = Config.backend + '/api/electricity';
      // Create a copy of filters, since params might add page option. Filters must
      // stay clean of page parameters since it also serves as key to the cache.
      var params = FilterFactory.getElectricity(hash);

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
      }).success(function(electricity) {
        setCache(electricity, hash, skipResetCache);

        deferred.resolve(electricityRecords(hash));

        // If there are more pages, read them.
        var hasNextPage = electricity.next != undefined;
        if (hasNextPage) {
          getDataFromBackend(hash, pageNumber + 1, true);
        }
      });

      return deferred.promise;
    }

    /**
     * Save data in cache, and broadcast an event to inform that the electricity data changed.
     *
     * @param electricity
     *   The data to cache.
     * @param key
     *   A key for the cached data - the hash code of the filters.
     * @param skipResetCache
     *   If false, a timer will be set to clear the cache in 60 sec.
     */
    function setCache(electricity, key, skipResetCache) {
      // Cache messages data.
      cache[key] = {
        data: (cache[key] ? cache[key].data : []).concat(electricity.data),
        limits: electricity.summary.electricity_interval,
        timestamp: new Date()
      };

      // Broadcast an update event.
      $rootScope.$broadcast(broadcastUpdateEventName, electricityRecords());

      // If asked to skip cache timer reset, return now.
      // Will happen when reading multiple page data - when reading pages
      // other then the first, there's no need to start a new timer to
      // reset the cache.
      if (skipResetCache) {
        return;
      }

      // Clear cache in 30 minutes.
      timeouts.push($timeout(function() {
        if (angular.isDefined(cache[key])) {
          cache[key] = undefined;
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
     * Return a object of electricity record.
     *
     * @param hash
     *  Hash string that reprsente the filters and the result of the query
     * @returns {*}
     */
    function electricityRecords(hash) {
      return (angular.isUndefined(hash)) ? cache : cache[hash] && cache[hash].data;
    }
  });


'use strict';

angular.module('negawattClientApp')
  .service('Electricity', function ($q, $http, $timeout, $rootScope, Config, md5) {

    // A private cache key.
    var cache = {};

    // Array of $timeout promises to clear the cache.
    var timeouts = [];

    var getElectricity;

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwElectricityChanged';

    /**
     * Return the promise with the meter list, from cache or the server.
     *
     * @returns {*}
     */
    this.get = function(filters) {
      // Create a hash from the filters object for indexing the cache
      var filtersHash = md5.createHash(JSON.stringify(filters));

      // Preparation of the promise and cache for Electricity request.
      getElectricity = $q.when(getElectricity || cache[filtersHash] && cache[filtersHash].data || getDataFromBackend(filters, filtersHash));

      // Clear the promise cached, after resolve or reject the promise. Permit access to the cache data, when
      // the promise excecution is done (finally).
      getElectricity.finally(function getElectricityFinally() {
        getElectricity = undefined;
      });

      return getElectricity;
    };

    /**
     * Return messages array from the server.
     *
     * @returns {$q.promise}
     */
    function getDataFromBackend(filters, filtersHash) {
      var deferred = $q.defer();
      var url = Config.backend + '/api/electricity';
      var params = {};

      if (filters) {
        // Add filter parameters to the http request
        // Filter format: filter[item]=value
        // For sub items, the format is: filter[item][subItem]=value
        params = {};
        angular.forEach(filters, function(item, key) {
          if (typeof item === 'object') {
            // item is an object, go through sub items
            angular.forEach(item, function(subItem, subKey) {
              params['filter['+key+']['+subKey+']'] = subItem;
            });
          }
          else {
            params['filter['+key+']'] = item;
          }
        });
      }

      $http({
        method: 'GET',
        url: url,
        params: params,
        cache: true
      }).success(function(electricity) {
        setCache(electricity.electricity, filtersHash);
        deferred.resolve(cache[filtersHash].data);
      });

      return deferred.promise;
    }

    /**
     * Save messages in cache, and broadcast an event to inform that the electricity data changed.
     *
     * @param data
     *   The data to cache.
     * @param key
     *   A key for the cached data.
     */
    function setCache(data, key) {
      // Cache messages data.
      cache[key] = {
        data: data,
        timestamp: new Date()
      };

      // Clear cache in 60 seconds.
      timeouts.push($timeout(function() {
        if (angular.isDefined(cache[key])) {
          cache[key].data = undefined;
        }
      }, 60000));
      $rootScope.$broadcast(broadcastUpdateEventName);
    }

    $rootScope.$on('nwClearCache', function() {
      cache = {};

      // Cancel Promises of timeout to clear the cache.
      angular.forEach(timeouts, function(timeout) {
        $timeout.cancel(timeout);
      });

      // Destroy pile of timeouts.
      timeouts = [];
    });
  });


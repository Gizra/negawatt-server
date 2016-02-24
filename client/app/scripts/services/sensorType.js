'use strict';

angular.module('negawattClientApp')
  .service('SensorType', function ($q, $http, $timeout, $state, $rootScope, $filter, Config, Utils) {
    var self = this;

    // A private cache key.
    var cache = {};

    // Promise in progress of sensorsType.
    var getSensorsType;

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwSiteSensorsTypeChanged';

    /**
     * Return the promise with the sensors-type, from cache or the server.
     *
     * @param accountId - int
     *  The account ID.
     *
     * @return {$q.promise}
     */
    this.get = function(accountId) {

      getSensorsType = $q.when(getSensorsType || sensorsTypeData() || getSensorsTypeFromServer(accountId));

      // Clear the promise cached, after resolve or reject the promise. Permit access to the cache data, when
      // the promise execution is done (finally).
      getSensorsType.finally(function getSensorsTypeFinally() {
        getSensorsType = undefined;
      });

      return getSensorsType;
    };

    /**
     * Return site-sensorsType array from the server.
     *
     * @return {$q.promise}
     */
    function getSensorsTypeFromServer(accountId) {
      var deferred = $q.defer();
      var url = Config.backend + '/api/sensor_types';
      var params = {account: accountId};
      $http({
        method: 'GET',
        url: url,
        params: params,
        cache: true
      }).success(function(sensorsType) {
        // Convert array to associative array.
        deferred.resolve(Utils.indexById(sensorsType.data));
      });

      return deferred.promise;
    }

    /**
     * Save sensorsType in cache, and broadcast en event to inform that the sensorsType data changed.
     *
     * @param data
     *    Collection resulted from the request.
     */
    function setCache(data) {
      // Cache sensorsType data.
      cache = {
        data: data,
        timestamp: new Date()
      };
      // Clear cache in 60 minutes.
      $timeout(function() {
        cache.data = undefined;
      }, 3600000);
      $rootScope.$broadcast(broadcastUpdateEventName);
    }

    /**
     * Return the sensor-tree data from the cache.
     */
    function sensorsTypeData() {
      return cache.data;
    }

    $rootScope.$on('nwClearCache', function() {
      cache = {};
    });

  });

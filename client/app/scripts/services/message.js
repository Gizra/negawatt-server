'use strict';

angular.module('negawattClientApp')
  .service('Message', function ($q, $http, $rootScope, $state, $timeout, Config) {

    // A private cache key.
    var cache = {
    };

    /**
     * Return the promise with the meter list, from cache or the server.
     *
     * @returns {*}
     */
    this.get = function() {
      return $q.when(cache.data || getDataFromBackend());
    };

    /**
     * Return messages array from the server.
     *
     * @returns {$q.promise}
     */
    function getDataFromBackend() {
      var deferred = $q.defer();
      var url = Config.backend + '/api/anomalous_consumption';
      $http({
        method: 'GET',
        url: url
      }).success(function(messages) {
        setCache(messages.data);
        deferred.resolve(cache.data);
      });

      return deferred.promise;
    }

    /**
     * Save messages in cache, and broadcast an event to inform that the messages data changed.
     *
     * @param data
     */
    function setCache(data) {
      // Cache messages data.
      cache = {
        data: data,
        timestamp: new Date()
      };
      // Clear cache in 60 seconds.
      $timeout(function() {
        cache.data = undefined;
      }, 60000);
      $rootScope.$broadcast('negawatt.messages.changed');
    }
  });

'use strict';

angular.module('negawattClientApp')
  .service('Session', function ($q, $http, $timeout, $state, $rootScope, Config) {
    var Session = this;

    // A private cache key.
    var cache = {};

    /**
     * Return the promise with the session list, from cache or the server.
     *
     * @returns {*}
     */
    this.get = function() {
      return $q.when(cache.data || getDataFromBackend());
    };

    /**
     * Return sessions array from the server.
     *
     * @returns {$q.promise}
     */
    function getDataFromBackend() {
      var deferred = $q.defer();
      var url = Config.backend + '/api/me';
      $http({
        method: 'GET',
        url: url,
        transformResponse: prepareSessionsData
      }).success(function(session) {
        setCache(session);
        deferred.resolve(cache.data);
      });

      return deferred.promise;
    }

    /**
     * Save sessions in cache, and broadcast en event to inform that the sessions data changed.
     *
     * @param data
     */
    function setCache(data) {
      // Cache sessions data.
      cache = {
        data: data,
        timestamp: new Date()
      };
      // Clear cache in 60 seconds.
      $timeout(function() {
        cache.data = undefined;
      }, 60000);
      $rootScope.$broadcast('negawattSessionChanged');
    }


    /**
     * Convert user information ia session message.
     *
     * @param data
     *   User information.
     *
     * @returns {*}
     *   object with user information and methods.
     */
    function prepareSessionsData(data) {
      var session = {};

      // Convert response serialized to an object.
      if (angular.isString(data)) {
        session = angular.fromJson(data).data;
      }

      return session;
    }


  });

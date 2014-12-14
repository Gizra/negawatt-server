'use strict';

angular.module('negawattClientApp')
  .service('Category', function ($q, $http, $timeout, $state, $rootScope, Config) {

    // A private cache key.
    var cache = {
      // Selected category.
      selected: {}
    };

    /**
     * Return the promise with the category list, from cache or the server.
     *
     * @returns {*}
     */
    this.get = function() {
      return $q.when(cache.data || getDataFromBackend());
    };

    /**
     * Return categories array from the server.
     *
     * @returns {$q.promise}
     */
    function getDataFromBackend() {
      var deferred = $q.defer();
      var url = Config.backend + '/api/meter_categories';
      $http({
        method: 'GET',
        url: url,
        transformResponse: prepareCategories
      }).success(function(categories) {
        setCache(categories);
        deferred.resolve(cache.data);
      });

      return deferred.promise;
    }

    /**
     * Save categories in cache, and broadcast en event to inform that the categories data changed.
     *
     * @param data
     */
    function setCache(data) {
      // Cache categories data.
      cache = {
        data: data,
        timestamp: new Date()
      };
      // Clear cache in 60 seconds.
      $timeout(function() {
        cache.data = undefined;
      }, 60000);
      $rootScope.$broadcast('negawatt.categories.changed');
    }


    /**
     * Convert the array of list of categories to and object of categories.
     *
     * Also prepare the lang and lat values so Leaflet can pick them up.
     *
     * @param list []
     *   List of categories in an array.
     *
     * @returns {*}
     *   List of categories organized in an object, each category keyed by its
     *   ID.
     */
    function prepareCategories(list) {
      return angular.isString(list) ? angular.fromJson(list).data : {};
    }
  });

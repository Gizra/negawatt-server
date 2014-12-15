'use strict';

angular.module('negawattClientApp')
  .service('Category', function ($q, $http, $timeout, $state, $rootScope, $filter, Config, Utils) {

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
     * @param response - {string}
     *   Response of the request that contains the List of categories in an array.
     *
     * @returns {*}
     *   List of categories organized in an object, each category keyed by its
     *   ID.
     */
    function prepareCategories(response) {
      var categories = {},
        list = angular.fromJson(response).data;

      // Save object of categories index by id.
      cache.categoriesIndexById = Utils.indexById(list);

      // Get categories in tree model.
      categories = getCategoryTree(list);

      return categories;
    }

    /**
     * Return a collection of categories in a tree view.
     *
     * @param list
     *    List of categories.
     *
     * @returns {*}
     */
    function getCategoryTree(list) {
      var categories = $filter('filter')(list, {depth: 0});

      return Utils.indexById(categories);
    }



  });

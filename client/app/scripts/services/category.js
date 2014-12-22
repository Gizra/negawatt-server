'use strict';

angular.module('negawattClientApp')
  .service('Category', function ($q, $http, $timeout, $rootScope, $filter, Config, Utils) {

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
     *    Collection resulted from the request.
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
     * Convert the array of list of categories to and object of categories, order in structure
     * tree (for the directive angular-ui-tree) and collection (used to index and select the categories).
     *
     * @param response - {string}
     *   Response of the request that contains the List of categories in an array.
     *
     * @returns {*}
     *   List of categories organized in an object, each category keyed by its
     *   ID.
     */
    function prepareCategories(response) {
      var categories = {};
      var list = angular.fromJson(response).data;

      // Categories indexed by id, used to easy select a categories.
      categories.collection = getCategoryCollection(list);
      // Get categories in tree model, used into the directive angular-ui-tree.
      categories.tree = getCategoryTree(list);

      return categories;
    }

    /**
     * Return categories in collection indexed by id.
     *
     * @param list
     *    List of categories.
     *
     * @returns {*}
     *    Categories collection indexed by id.
     */
    function getCategoryCollection(list) {

      return Utils.indexById(list);
    }

    /**
     * Return categories in a tree model.
     *
     * @param list
     *    List of categories.
     *
     * @returns {*}
     *
     */
    function getCategoryTree(list) {
      var categories = $filter('filter')(list, {depth: 0});

      var categoryTree;

      // Replace children category ID for the category it self.
      list = updateCategoryWithChildren(list);
      categoryTree = $filter('filter')(list, {depth: 0});


      return categoryTree;
    }

    /**
     * Replace the list of categories with children objects instead children id..
     *
     * @param list - {*[]}
     *    Categories, with children with ID.
     *
     * @returns Array - [*[]]
     *    Categories, with children object.
     *
     */
    function updateCategoryWithChildren(list) {
      // Save object of categories index by id.
      var categoriesIndexById = Utils.indexById(list),
        categories = [];

      // Replace children id for category object.
      angular.forEach(list, function(item) {
        angular.forEach(item.children, function(child, index) {
          item.children[index] = categoriesIndexById[child];
        });

        this.push(item);
      }, categories);

      return list;
    }

  });

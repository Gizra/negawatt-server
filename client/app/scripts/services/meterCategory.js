'use strict';

angular.module('negawattClientApp')
  .service('MeterCategory', function ($q, $http, $timeout, $state, $rootScope, $filter, Config, Utils, Meter, FilterFactory) {
    var self = this;

    // A private cache key.
    var cache = {};

    // Promise in progress of categories.
    var getCategories;

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwMeterCategoriesChanged';

    /**
     * Return the promise with the meter-categories list, from cache or the server.
     *
     * @param accountId - int
     *  The account ID.
     * @param categoryId - int
     *  The category ID.
     *
     * @return {Promise}
     */
    this.get = function(accountId, categoryId) {

      getCategories = $q.when(getCategories || categoriesFiltered() || getCategoriesFromServer(accountId));

      // Prepare the categories object.
      getCategories = prepareCategories(getCategories, accountId);

      // Filtering in the case we have categoryId defined.
      if (angular.isDefined(categoryId)) {
        // Set Activity Category.
        getCategories = getCategoriesFilterByCategory(getCategories, categoryId);
      }

      // Clear the promise cached, after resolve or reject the promise. Permit access to the cache data, when
      // the promise excecution is done (finally).
      getCategories.finally(function getCategoriesFinally() {
        getCategories = undefined;
      });

      return getCategories;
    };

    /**
     * Reset the category filters.
     */
    this.reset = function() {
      FilterFactory.set('categorized', categoriesFiltered());
    };

    /**
     * Return meter-categories array from the server.
     *
     * @return {$q.promise}
     */
    function getCategoriesFromServer(accountId) {
      var deferred = $q.defer();
      var url = Config.backend + '/api/meter_categories';
      var params = {account: accountId};
      $http({
        method: 'GET',
        url: url,
        params: params,
        cache: true,
        transformResponse: prepareSelector
      }).success(function(categories) {
        deferred.resolve(categories.data);
      });

      return deferred.promise;
    }

    /**
     * Return a promise with the categories list, filtered by category.
     *
     * @param getCategories
     *  Promise with the list of categories.
     * @param categoryId
     *  The category ID.
     *
     * @return {$q.promise}
     *  Promise with the list of filtered categories.
     */
    function getCategoriesFilterByCategory(getCategories, categoryId) {
      var deferred = $q.defer();

      // Filter meters by category.
      getCategories.then(function getCategoriesFilteredByCategoryResolve(categories) {
        // Necessary to separate the cache from the filtering.
        categories = categories;
        categories.collection = $filter('filter')(Utils.toArray(categories.collection),
          {id: parseInt(categoryId)}, true).pop().children;
        deferred.resolve(categories);
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
      // Clear cache in 60 minutes.
      $timeout(function() {
        cache.data = undefined;
      }, 3600000);
      $rootScope.$broadcast(broadcastUpdateEventName);
    }


    /**
     * Add the number of the meters to each categories.
     *
     * Prepare categories object with order by list, tree and collection indexed by id.
     *
     * Return the categories object into a promises.
     *
     * @param getCategories - {$q.promise)
     *  Promise of list of categories, comming from cache or the server.
     * @param accountId - int
     *  The account ID.
     */
    function prepareCategories(getCategories, accountId) {
      var deferred = $q.defer();

      // Get all the meters.
      Meter.get(accountId).then(function(meters) {
        self.meters = Utils.toArray(meters.listAll);
        getCategories
          .then(prepareData)
          .then(function prepareCategoriesResolve(categories) {
            setCache(categories);
            deferred.resolve(categoriesFiltered());
          });
      });

      return deferred.promise;
    }

    /**
     * Convert the array of categories to an object with properties list, collection and tree.
     *
     * list: an array of the categories,
     * collection: an indexed array (object) of the categories (used to index and select the categories),
     * tree: the categories in tree structure (for the directive angular-ui-tree).
     *
     * @param list - {string}
     *   Response of the request that contains the List of categories in an array.
     *
     * @return {*}
     *   List of categories organized in an object, each category keyed by its ID.
     */
    function prepareData(list) {
      var deferred = $q.defer();
      var meterCategories = {};

      // Categories in an original list array.
      // Used to update the amount of meters by categories while downloading multiple pages.
      meterCategories.list = list;
      // Categories indexed by id, used to easy select a categories.
      meterCategories.collection = Utils.indexById(list);
      // Categories in tree model, used for angular-ui-tree directive.
      meterCategories.tree = getCategoryTree(list);

      deferred.resolve(meterCategories);
      return deferred.promise;
    }

    /**
     * Return categories in a tree model.
     *
     * @param list
     *    List of categories.
     *
     * @return {*}
     */
    function getCategoryTree(list) {
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
     * @return Array - [*[]]
     *    Categories, with children object.
     */
    function updateCategoryWithChildren(list) {
      // Save object of categories index by id.
      var categoriesIndexById = Utils.indexById(list),
        categories = [];

      // Replace children id for category object.
      angular.forEach(list, function(item) {
        angular.forEach(item.children, function(child, index) {
          if (angular.isString(child)) {
            item.children[index] = categoriesIndexById[child];
          }
        });

        this.push(item);
      }, categories);

      return list;
    }

    /**
     * Return the category cache filter.
     */
    function categoriesFiltered() {

      if (angular.isDefined(cache.data)) {
        // Refresh categories tree with the filter values.
        cache.data.tree = FilterFactory.refreshCategoriesFilters(cache.data.tree);
      }

      return cache.data;
    }

    /**
     * Add properties for check/unchech handling.
     *
     * Add 'checked', 'indeterminate' properties to each element on data, used to handle
     * check/uncheck for category selection.
     *
     * @param response
     *  The response from the category request.
     *
     * @return {*}
     */
    function prepareSelector(response) {
      response = angular.fromJson(response);
      var categories = response.data;

      angular.forEach(categories, function(category, index) {
        categories[index] = angular.extend(category, {checked: true, indeterminate: false});
      });

      response.data = categories;

      return response;
    }

    $rootScope.$on('nwClearCache', function() {
      cache = {};
    });

  });

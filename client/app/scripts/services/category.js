'use strict';

angular.module('negawattClientApp')
  .service('Category', function ($q, $http, $timeout, $state, $rootScope, $filter, Config, Utils, Meter) {
    var self = this;

    // A private cache key.
    var cache = {};

    // Promise in progress of categories.
    var getCategories;

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwCategoriesChanged';

    /**
     * Returns the selected category ID.
     *
     * @returns {*}
     */
    this.getSelectedCategory = function() {
      return cache.selected;
    };

    /**
     * Save the selected category ID, if categoryId ID is empty save undefined.
     *
     * @param categoryId
     *  The category ID.
     */
    this.setSelectedCategory = function(categoryId) {
      cache.selected = categoryId;
    };

    /**
     * Delete selected category ID.
     *
     * @returns {*}
     */
    this.clearSelectedCategory = function() {
      cache.selected = undefined;
    };

    /**
     * Return the promise with the category list, from cache or the server.
     *
     * @param accountId - int
     *  The account ID.
     * @param categoryId - int
     *  The category ID.
     *
     * @returns {Promise}
     */
    this.get = function(accountId, categoryId) {

      getCategories = $q.when(getCategories || cache.data || getCategoriesFromServer(accountId));

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
     * Return categories array from the server.
     *
     * @returns {$q.promise}
     */
    function getCategoriesFromServer(accountId) {
      var deferred = $q.defer();
      var url = Config.backend + '/api/meter_categories';
      var params = {account: accountId};
      $http({
        method: 'GET',
        url: url,
        params: params,
        cache: true
      }).success(function(categories) {
        deferred.resolve(categories.data);
      });

      return deferred.promise;
    }

    /**
     * Return a promise with the categories list, filter by category.
     *
     * @param getCategories
     *  Promise with the list of categories.
     * @param categoryId
     *  The category ID.
     * @returns {$q.promise}
     *  Promise with the list of categories filtered.
     */
    function getCategoriesFilterByCategory(getCategories, categoryId) {
      var deferred = $q.defer();

      // Filter meters with a category.
      getCategories.then(function getCategoriesFilterByCategoryResolve(categories) {
        // Necessary to separate the cache from the filtering.
        categories = categories;
        categories.collection = $filter('filter')(Utils.toArray(categories.collection), {id: parseInt(categoryId)}, true).pop().children;
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
      // Clear cache in 10 minutes.
      $timeout(function() {
        cache.data = undefined;
      }, 60000);
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
     *
     */
    function prepareCategories(getCategories, accountId) {
      var deferred = $q.defer();

      // Get all the meters.
      Meter.get(accountId).then(function(meters) {
        self.meters = Utils.toArray(meters.listAll);
        getCategories
          .then(addNumberOfMetersByCategory)
          .then(prepareData)
          .then(function prepareCategoriesResolve(categories) {
            setCache(categories);
            deferred.resolve(cache.data);
          });
      });

      return deferred.promise;
    }


    /**
     * Calculate the quantity of the meters for each category and quantity of meters in his children categories.
     *
     * @param categories - string|{*}
     *    List of categories wrapped in $http request response or cache object.
     * @returns {*}
     *    List of categories with the quantity of meters in the category.
     *
     */
    function addNumberOfMetersByCategory(categories) {
      var deferred = $q.defer();
      var metersCategories;
      var list = (angular.isArray(categories)) ? categories : categories.list;

      // Set meters in 0.
      angular.forEach(list, function(category) {
        category.meters = 0;
      }, list);

      // Index categories.
      self.indexed = Utils.indexById(list);

      // Get the meter list categories.
      metersCategories = self.meters
        .map(function(meter) {
          return meter.meter_categories ? meter.meter_categories : [];
        });

      angular.forEach(metersCategories, function(categories) {
        angular.forEach(categories, function(category) {
          // Set selected categories.
          var categoriesIds = [+category.id] ;

          // Increase amount of meters.
          angular.forEach(categoriesIds, function(itemsId) {
            self.indexed[itemsId].meters++;
          });
        });
      });

      // Return list
      list = Utils.toArray(self.indexed);
      deferred.resolve(list);

      return deferred.promise;
    }

    /**
     * Convert the array of list of categories to and object of categories, order in structure
     * tree (for the directive angular-ui-tree) and collection (used to index and select the categories).
     *
     * @param list - {string}
     *   Response of the request that contains the List of categories in an array.
     *
     * @returns {*}
     *   List of categories organized in an object, each category keyed by its
     *   ID.
     */
    function prepareData(list) {
      var deferred = $q.defer();
      var categories = {};

      // Categories in an original list array. Used to update the amount of meters by categories whe are multiple pages.
      categories.list = list;
      // Categories indexed by id, used to easy select a categories.
      categories.collection = getCategoryCollection(list);
      // Get categories in tree model, used into the directive angular-ui-tree.
      categories.tree = getCategoryTree(list);

      deferred.resolve(categories);
      return deferred.promise;
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
          if (angular.isString(child)) {
            item.children[index] = categoriesIndexById[child];
          }
        });

        this.push(item);
      }, categories);

      return list;
    }

    /**
     * Return parent id, if the category id have parent.
     *
     * @param categoryId
     *    Child category Id.
     *
     * @param categories
     *    List of categories.
     *
     * @returns {*}
     */
    function getParentId(categoryId, categories) {
      // Check if have parent.
      var parent = ($filter('filter')(categories, {children: categoryId}, true)).pop();

      return (angular.isDefined(parent)) ? parent.id : undefined;
    }

    $rootScope.$on('nwClearCache', function() {
      cache = {};
    });

  });

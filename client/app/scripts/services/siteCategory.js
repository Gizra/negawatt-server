'use strict';

angular.module('negawattClientApp')
  .service('Category', function ($q, $http, $timeout, $state, $rootScope, $filter, Config, Utils, Site, Meter, FilterFactory) {
    var self = this;

    // A private cache key.
    var cache = {};

    // Promise in progress of categories.
    var getCategories;

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwSiteCategoriesChanged';

    /**
     * Return the promise with the site-categories list, from cache or the server.
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
     * Return site-categories array from the server.
     *
     * @return {$q.promise}
     */
    function getCategoriesFromServer(accountId) {
      var deferred = $q.defer();
      var url = Config.backend + '/api/site_categories';
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

      // Filter sites by category.
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
     * Add the number of the sites to each categories.
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

      // Get all the sites.
      Site.get(accountId).then(function(sites) {
        self.sites = Utils.toArray(sites.listAll);
        getCategories
          .then(addParentToCategory)
          .then(addNumberOfSitesByCategory)
          .then(prepareData)
          .then(function prepareCategoriesResolve(categories) {
            setCache(categories);
            deferred.resolve(categoriesFiltered());
          });
      });

      return deferred.promise;
    }

    /**
     * Calculate the quantity of the sites for each category and quantity of sites in his children categories.
     *
     * @param categories - string|{*}
     *    List of categories wrapped in $http request response or cache object.
     *
     * @return {*}
     *    List of categories with the quantity of sites in the category.
     */
    function addParentToCategory(categories) {
      var deferred = $q.defer();
      var list = (angular.isArray(categories)) ? categories : categories.list;

      // Set parent to null.
      angular.forEach(list, function (category) {
        category.parent = null;
      }, list);

      // Index categories.
      self.indexed = Utils.indexById(list);

      // Get the site list categories.
      var categoryIds = Object.keys(self.indexed);

      // Add index of parent
      angular.forEach(categoryIds, function (categoryId) {
        angular.forEach(self.indexed[categoryId].children, function (childId) {
          // On second time we arrive here, children are objects
          // (after more sites or meters pages arrive).
          if (typeof(childId) == 'object') {
            childId = childId.id;
          }
          self.indexed[childId].parent = categoryId;
        });
      });

      // Return list
      deferred.resolve(list);

      return deferred.promise;
    }

    /**
     * Calculate the number of sites for each category and number of sites
     * in its children categories.
     *
     * @param categories - string|{*}
     *    List of categories wrapped in $http request response or cache object.
     *
     * @return {*}
     *    List of categories with the quantity of sites in the category.
     */
    function addNumberOfSitesByCategory(categories) {
      var deferred = $q.defer();
      var list = (angular.isArray(categories)) ? categories : categories.list;

      // Set numberOfSites to 0.
      angular.forEach(list, function (category) {
        category.numberOfSites = 0;
      }, list);

      // Get a list of sites per categories.
      var sitesPerCategory = {};
      angular.forEach(list, function (category) {
          sitesPerCategory[category.id] = category.sites.length;
        });

      angular.forEach(sitesPerCategory, function (sitesNumber, categoryId) {
        // Propagate number of sites up the parents hierarchy.
        if (sitesNumber) {
          while (categoryId) {
            var category = self.indexed[categoryId];
            if (category) {
              // Increment number of sites.
              category.numberOfSites += sitesNumber;
              // Go and do the same for parent category.
              categoryId = category.parent;
            }
          }
        }
      });

      // Return list
      list = Utils.toArray(self.indexed);
      deferred.resolve(list);

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
      var categories = {};

      // Categories in an original list array.
      // Used to update the amount of sites by categories while downloading multiple pages.
      categories.list = list;
      // Categories indexed by id, used to easy select a categories.
      categories.collection = Utils.indexById(list);
      // Categories in tree model, used for angular-ui-tree directive.
      categories.tree = getCategoryTree(list);

      deferred.resolve(categories);
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
     * For a site with only one meter, add the meter as category site.
     *
     * When building categories tree (below), sites are added to the category.sites array.
     * However, for a site with only one meter (usually a site with IEC meter only), put
     * the meter directly in the category's meters array.
     *
     * @param category
     *    A category object.
     * @param meterId
     *    The id of the meter to add as site.
     */
    function addMeterAsCategorySite(category, meterId) {
      // Before adding the meter, make sure it wasn't added already.
      if (category.meters && category.meters.indexOf(meterId) >= 0) {
        return;
      }
      // Define meters array if not existing yet.
      if (!category.meters) {
        category.meters = [];
      }
      category.meters.push(meterId);
    }

    /**
     * For a site with only one meter, add the meter as category site.
     *
     * When building categories tree (below), sites are added to the category.sites array.
     * However, for a site with only one meter (usually a site with IEC meter only), put
     * the meter directly in the category's meters array.
     *
     * @param category
     *    A category object.
     * @param meterId
     *    The id of the meter to add as site.
     */
    function addCategorySite(category, site) {
      // More then one meter for the site. Add the site as a child site-category.
      // Before adding the site, make sure it wasn't added already.
      // Use 'for' here so 'return' will continue the 'forEach' loop.
      for (var existingChildId in category.children) {
        var existingChild = category.children[existingChildId];
        if (existingChild.isSite && existingChild.id == site.id) {
          // Child id exists. Skip to the next child.
          return;
        }
      }
      // Add the site as-if it was a site category, mark it with isSite: true.
      category.children.push({
        id: site.id,
        label: site.label,
        meters: site.meters,
        isSite: true});
      // @todo: Update number-of-sites counter in the category and its parents.
      // @todo: Note that on next time the tree is built, the child site will not be added again and the number-or-sites will not be incremented.
      category.numberOfSites++;
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
        sitesIndexById = Utils.indexById(self.sites),
        categories = [];

      // Add child categories and sites to the tree.
      angular.forEach(list, function(category) {
        // Replace children id by category object.
        angular.forEach(category.children, function(childId, index) {
          // On second run of updateCategoryWithChildren(), some children will already be category objects.
          if (typeof(childId) != 'object') {
            category.children[index] = categoriesIndexById[childId];
          }
        });

        // Add sites to the tree.
        angular.forEach(category.sites, function(siteId) {

          // Make sure site exists. It might not have been loaded yet
          // (if there are several site pages).
          if (typeof(sitesIndexById[siteId]) !== 'undefined') {
            var site = sitesIndexById[siteId];
            if (!site.meters || site.meters.length == 0) {
              // Skip sites with no meters.
              return;
            }

            // If there's only one meter for the site, add the meter and not the site.
            if (site.meters.length == 1) {
              addMeterAsCategorySite(category, site.meters[0]);
            }
            else {
              // More then one meter for the site. Add the site as a child site-category.
              addCategorySite(category, site);
            }
          }
        });

        this.push(category);
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

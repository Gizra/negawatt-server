'use strict';

angular.module('app')
  .service('Category', function ($http, $q, NegawattConfig, $filter, Utils, $rootScope) {
    var Category = this;

    /**
     * Return the label property of the category id passed.
     *
     * @param id
     * @returns {*}
     */
    this.labelFilteredCategoryById = function(id) {
      // Get label of selected category.
      return $filter('filter')(Category.cache, {id: id})[0].label;
    };

    /**
     * Convert all the properties of parent and child in arrays.
     *
     * @param categories
     *  Categories indexed by id, ordened like a tree.
     * @returns {*}
     */
    function toArray(categories) {
      categories = Utils.toArray(categories);

      // Convert children to Arrays until last generation.
      angular.forEach(categories, function(category) {
        if (category.children) {
          category.children = toArray(category.children);
        }
      }, categories);

      return categories;
    }

    /**
     * Add properties used by the directive negawatt-menu to the object tree.
     *
     * @param categories
     *  Categories order like tree.
     * @returns {*}
     *  Categories with property show.
     */
    function addDirectiveProperties(categories) {

      angular.forEach(categories, function(category, id) {
        this[id].show = (category.depth === 0) ? true : false;

        if (category.children) {
          category.children = addDirectiveProperties(category.children);
        }
      }, categories);

      return categories;
    }

    /**
     * From an array of categories, return an object indexed by id of the category.
     *
     * @returns {*}
     */
    function getChildrenIndexedById(children) {

      angular.forEach(children, function(childId, index) {
        var child = Category.indexed[childId];
        // Move object.
        this[index] = child;

        // Mark as moved.
        Category.cache[childId].moved = true;

        // Get children of the children.
        if (child.children) {
          this[index].children = getChildrenIndexedById(child.children);
        }
      }, children);

      children = Utils.indexById(children);

      return children;
    }

    /**
     * Return the categorires order by tree, from a collection of categories.
     *
     * @param categories
     *   Categorires indexed by id.
     * @returns {*}
     *   Categories order in tree structure.
     */
    function getTree(categories) {
      var tree = {},
        children;

      Category.cache = {};

      // Duplicate categories to set nodes will be deleted.
      angular.copy(categories, Category.cache);

      angular.forEach(Category.cache, function(node, id) {
        children = null;
        // Validate if have children.
        if (node.children) {
          children = getChildrenIndexedById(node.children);
        }

        // Set the new values.
        this[id] = node;
        this[id].children = children;

      }, Category.cache);

      // Remove all the moved categories.
      angular.forEach(Category.cache, function(category, id) {
        if (category.moved) {
          delete Category.cache[id];
        }
      });

      return Category.cache;
    }

    /**
     * Create index object.
     *
     * @param data
     * @returns {*}
     */
    function transformCategories(data) {
      var list = [];

      data = JSON.parse(data);

      // Get list of categories.
      list = data.data;

      // Object of categories indexed by id and with the childs information.
      Category.indexed = Utils.indexById(list);

      // Category organized by tree.
      Category.tree = getTree(Category.indexed);

      return Category.tree;
    }

    /**
     * Return a collection of categories.
     *
     * @returns {$http}
     */
    this.getCategories = function() {
      return $http({
        method: 'GET',
        url: NegawattConfig.backend + '/api/meter_categories',
        transformResponse: [transformCategories, addDirectiveProperties, toArray]
      });
    };

    /**
     * From a collection of meters filter the categories (in cache).
     *
     * @param meters
     */
    this.filterByMeterCategories = function(meters) {
      var metersCategorized = $filter('filter')(Utils.toArray(meters), {'meter_categories': '!!'});
      var categoriesDefined = [],
        categoriesFiltered = [];

      angular.forEach(metersCategorized, function(meter) {

        angular.forEach(meter.meter_categories, function(categoryId) {

          // Check if already get the category id.
          if (this.indexOf(categoryId) === -1) {
            this.push(parseInt(categoryId));
          }
        }, categoriesDefined);

      });

      // Filter category collection cached.
      $filter('filter')(Category.cache, function(category) {

        if (categoriesDefined.indexOf(category.id) !== -1) {
          categoriesFiltered.push(category);
        }

      });

      // Update service and scope objects.
      Category.cache = categoriesFiltered;
      $rootScope.$broadcast('negawatt.category.filtered', Category.cache);
    };

  });

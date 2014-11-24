'use strict';

angular.module('app')
  .service('Category', function ($http, $q, NegawattConfig, $filter, Utils, $rootScope) {
    var Category = this;

    /**
     * Add property to apply the menu style.
     *
     * @param data
     * @returns {*}
     */
    function addStyle(data) {
      data = JSON.parse(data);
      // If the response status is different to 200 the data property is not defined.
      if (angular.isUndefined(data.data)) {
        return;
      }

      var items = data.data;

      angular.forEach(items, function(item) {
        item.style = '{\'margin-right\': \'' + item.depth * 20 + 'px\'}';
      });

      return data;
    }

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
     * Return a collection of categories.
     *
     * @returns {$http}
     */
    this.getCategories = function() {
      return $http({
        method: 'GET',
        url: NegawattConfig.backend + '/api/meter_categories',
        transformResponse: addStyle
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

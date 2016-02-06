'use strict';

angular.module('negawattClientApp')

  .factory('FilterFactory', function ($filter, $state, $stateParams, $rootScope, $injector, Utils) {
    return {
      filters: {},

      /**
       * Filter meters by categories checked on the category menu
       * (categories filters).
       *
       * @param meters
       *   The meters collection.
       *
       * @returns {*}
       *  The meters collection filter by a collection of categories.
       */
      byCategoryFilters: function(meters) {
        meters = Utils.toArray(meters.listAll);

        meters = $filter('filterMeterByCategories')(meters, getCategoriesChecked.bind(this)(), this.isDefine('categories'));

        return meters;
      },

      /**
       * Clear the all the filters for the meters and also
       */
      clear: function () {
        this.clearMeterSelection();
        $stateParams.chartNextPeriod = undefined;
        $stateParams.chartPreviousPeriod = undefined;

        // Clear all the filters.
        this.filters = {};
      },

      /**
       * Return meter saved in the meter filters service.
       *
       * @returns {*|undefined}
       */
      getMeterSelected: function() {
        return this.filters.meterSelected || undefined;
      },

      /**
       * Extend the categories with the category filters.
       *
       * @param categories
       *  The category tree object, used by the menu.
       *
       * @returns {*}
       *  The category tre object with category filters updated.
       */
      refreshCategoriesFilters: function(categories) {
        // Get category filters.
        var categorized = this.get('categories');

        // Extend object categories.
        categories.$$extendWithFilter = $$extendWithFilter;

        return categorized && categories.$$extendWithFilter(categorized) || categories;
      },

      /**
       * Return if is defined a filter.
       *
       * @param name {string}
       *   The name of the filter.
       */
      isDefine: function (name) {
        var isDefined = !!this.filters[name];

        if (angular.isArray(this.filters[name])) {
          isDefined = !!this.filters[name].length;
        }

        return isDefined;
      },

      /**
       * Save a value in filters list.
       *
       * @param name
       *  The value's name.
       * @param value
       *  The value.
       */
      set: function (name, value) {
        // Use angular copy to decouple from the source value,
        // example: category cache.
        value = angular.copy(value);
        this.filters[name] = value;
      },

      /**
       * Get a value from the filters list.
       *
       * @param name
       *  The value's name.
       */
      get: function (name) {
        return this.filters && this.filters[name];
      },
    };

    /**
     * Translate selector type and ID to filters.
     *
     * @param accountId
     *   User account ID.
     * @param chartFreq
     *   Required frequency, e.g. 2 for MONTH.
     * @param selectorType
     *   Type of filter, e.g. 'meter' or 'site_category'.
     * @param selectorId
     *   ID of the selector, e.g. meter ID or category ID.
     * @param period
     *   Object with the period selected.
     *
     * @returns {Object}
     *   Filters array in the form required by get().
     */
    function filtersFromSelector(params) {
      var FilterFactory = $injector.get('FilterFactory');

      // Prepare filters for data request.
      var filters = {
        'filter[meter_account]': params.accountId,
        'filter[frequency]': params.chartFreq
      };

      // Check noData option.
      if (params.noData) {
        // No need for timestamp filters
        angular.extend(filters, {
          nodata: 1
        });
        FilterFactory.set('electricity-nodata', true);
      }
      else {
        // Add filters by period.
        angular.extend(filters, {
          'filter[timestamp][operator]': 'BETWEEN',
          'filter[timestamp][value][0]': params.chartPreviousPeriod || '',
          'filter[timestamp][value][1]': params.chartNextPeriod || ''
        });
        // Set filter electricity.nodata
        FilterFactory.set('electricity-nodata', false);
      }

      if (params.selectorType) {
        if (params.multipleGraphs()) {
          // If multiple IDs are given, output in the format:
          // filter[selector][operator] = IN
          // filter[selector][value][0] = val-1
          // filter[selector][value][1] = val-2
          // ... etc.
          filters['filter[' + params.selectorType + '][operator]'] = 'IN';
          var i = 0;
          angular.forEach(params.selectorId, function (id) {
            filters['filter[' + params.selectorType + '][value][' + i++ + ']'] = id;
          });
        }
        else {
          // A single ID was given, Output in the format:
          // filter[selector] = val
          filters['filter[' + params.selectorType + ']'] = params.selectorId;
        }
      }

      return filters;
    }

    /**
     * Return an array of the category ids, checked.
     *
     * @returns {Array}
     */
    function getCategoriesChecked(categories) {
      var filter = [];
      var categories = categories || this.get('categories');
      // Return filter object.
      angular.forEach(categories, function(category) {

        if (category.checked) {
          filter.push(category.id);
        }

        if (category.children) {
          filter = filter.concat(getCategoriesChecked(category.children));
        }
      });

      return filter;
    }

    /**
     * Method that extend the category tree object, to extend it with their
     * filters.
     *
     * @param category
     *  The category filters.
     */
    function $$extendWithFilter(categoriesFilters, categories) {
      categories = categories || this;

      // Refresh only categories with meters.
      angular.forEach(categories, function(category, index) {
        var childrenCheckedState;
        var categoryFilter = categoriesFilters.getCategoryFilter(category.id);
        // hasCategoryFilters
        if (angular.isDefined(categoryFilter)) {
          // Keep meters (in this category), and children from the original
          // category object. Important for the lazyload data.
          angular.extend(categories[index], categoryFilter, {
            meters: category.meters,
            children: category.children
          });
          categories[index].indeterminate = isInderminate(category.id);

          // Check if the children have tha same 'checked' value.
          // Note that 'children' might be an empty array.
          if (category.children && category.children.length) {
            childrenCheckedState = getChildrenCheckedState(category.children);
            if (childrenCheckedState !== 'indeterminate') {
              categories[index].checked = childrenCheckedState;
              categories[index].indeterminate = false;
            }
          }
        }

        if (category.children) {
          categories[index].children = $$extendWithFilter(categoriesFilters, category.children);
        }
      });

      return categories;
    }

  });

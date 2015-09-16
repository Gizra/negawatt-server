'use strict';

angular.module('negawattClientApp')

  .factory('FilterFactory', function ($filter, $state, $stateParams, $rootScope, $injector, Utils) {
    return {
      filters: {},

      /**
       * Add or remove an object form the active-electricity-filter after clicking
       * the checkbox in the categories/meters tree.
       *
       * @param sel
       *   Selection type (e.g. 'site'.
       * @param ids
       *   Ids of selected objects.
       */
      updateSelection: function(sel, ids) {
        $stateParams.sel = sel;
        $stateParams.ids = ids;

        // Refresh $state with new params.
        $state.refreshUrlWith($stateParams);

        this.setElectricity($stateParams);
      },

      /**
       * Add or remove an object form the active-electricity-filter after clicking
       * the checkbox in the categories/meters tree.
       *
       * @param object
       *   The meter object.
       * @param name
       *   The name of the object.
       *
       * @return boolean
       *   True if objects are selected, false if the last object is unselected.
       */
      addObjectSelected: function(object, name) {
        var objectsSelected = true;

        if (!object.selected) {
          // object unselected, remove it from state-params.
          var objects = $stateParams.ids.split(',');
          // object.id is a number, objects is an array of strings. Convert object.id to string.
          objects.splice(objects.indexOf('' + object.id), 1);
          $stateParams.ids = objects.join();

          // Unset sel if no object is selected
          if ($stateParams.ids == '') {
            $stateParams.sel = undefined;
            objectsSelected = false;
          }
        }
        else {
          // object selected.
          // Set selected object to object.
          $stateParams.sel = name;

          // Select the object.
          var objects = $stateParams.ids ? $stateParams.ids.split(',') : [];
          objects.push(object.id);
          $stateParams.ids = objects.join();
        }

        // Refresh $state with new params.
        this.updateSelection($stateParams.sel, $stateParams.ids);

        return objectsSelected;
      },

      /**
       * Add or remove a meter form the active-electricity-filter after clicking
       * the checkbox in the categories/meters tree.
       *
       * @param meter
       *   The meter object.
       *
       * @return boolean
       *   True if objects are selected, false if the last object is unselected.
       */
      addMeterSelected: function(meter) {
        return this.addObjectSelected(meter, 'meter');
      },

      /**
       * Add or remove a category form the active-electricity-filter after clicking
       * the checkbox in the categories/meters tree.
       *
       * @param category
       *   The category object.
       *
       * @return boolean
       *   True if objects are selected, false if the last object is unselected.
       */
      addSiteCategorySelected: function(category) {
        return this.addObjectSelected(category, 'site_category');
      },

      /**
       * Add or remove a site form the active-electricity-filter after clicking
       * the checkbox in the categories/meters tree.
       *
       * @param site
       *   The site object.
       *
       * @return boolean
       *   True if objects are selected, false if the last object is unselected.
       */
      addSiteSelected: function(site) {
        return this.addObjectSelected(site, 'meter_site');
      },

      /**
       * Add or remove an object form the active-electricity-filter after clicking
       * the checkbox in the categories/meters tree.
       *
       * @param object
       *   The meter object.
       * @param name
       *   The name of the object.
       *
       * @return boolean
       *   True if objects are selected, false if the last object is unselected.
       */
      addClimateSelected: function(meter) {
        var metersSelected = true;

        if (!meter.selected) {
          // meter unselected, remove it from state-params.
          var meters = $stateParams.climate.split(',');
          // object.id is a number, objects is an array of strings. Convert object.id to string.
          meters.splice(meters.indexOf('' + meter.id), 1);
          $stateParams.climate = meters.join();

          // Unset sel if no object is selected
          if ($stateParams.climate == '') {
            metersSelected = false;
          }
        }
        else {
          // Select the object.
          var meters = $stateParams.climate ? $stateParams.climate.split(',') : [];
          meters.push(meter.id);
          $stateParams.climate = meters.join();
        }

        // Refresh $state with new params.
        $state.refreshUrlWith($stateParams);

        this.setTemperature($stateParams);

        return metersSelected;
      },

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
       * Return if need it, to show checkboxes to filter meter by categories.
       *
       * @returns {boolean}
       */
      showCategoryFilters: function() {
        var showControls = false;
        if ($state.is('dashboard.withAccount')) {
          showControls = true;
        }
        return showControls;
      },

      /**
       * Clear the all the filters for the meters and also
       */
      clear: function() {
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
       * Save in the meter filters service, the meter selected.
       *
       * @param meter
       *  The meter object.
       */
      setMeterSelected: function(meter) {
        this.filters.meterSelected = meter;
      },

      /**
       * Clear the meter selection saved.
       */
      clearMeterSelection: function() {
        if (angular.isDefined(this.filters.meterSelected)) {
          this.filters.meterSelected.unselect();
        }

        //Clear filters.
        this.filters.meterSelected = undefined;
        this.filters.meter = undefined;
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
       * Return the electricity filters according a hash.
       *
       * @param hash
       *  The hash.
       *
       * @returns {*}
       *  The electricity filters.
       */
      getElectricity: function(hash) {
        return this.filters['electricity'] && this.filters['electricity'][hash];
      },

      /**
       * Return the temperature filters according a hash.
       *
       * @param hash
       *  The hash.
       *
       * @returns {*}
       *  The temperature filters.
       */
      getTemperature: function(hash) {
        return this.filters['temperature'] && this.filters['temperature'][hash];
      },

      /**
       * Return if is defined a filter.
       *
       * @param name {string}
       *   The name of the filter.
       */
      isDefine: function(name) {
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
      set: function(name, value) {
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
      get: function(name) {
        return this.filters && this.filters[name];
      },

      /**
       * Save of the params as current electricity filter.
       *
       * @param params
       *  Parameter object regularly coming from the query string.
       */
      setElectricity: function (params) {
        // Prepare electricity filter in querystring format.
        var filter = getElectricityFilter(params);
        // Create and save hash.
        var hash = Utils.objToHash(filter);
        this.set('activeElectricityHash', hash);

        // Clean Properties.
        filter = Utils.cleanProperties(filter);

        // Set property with the filters.
        this.filters['electricity'] = angular.isUndefined(this.filters['electricity']) ? {} : this.filters['electricity'];
        this.filters['electricity'][this.get('activeElectricityHash')] = filter;
      },

      /**
       * Set the states of the filter checkoxes control.
       *
       * @param value {Array[{*}]|{*}}
       *  The categories collection or the object with the value update.
       */
      setCategories: function (value) {
        // Get categories object.
        var categories = getCategories(value);

        this.filters['categories'] = categories;

        // Add extra methods to the object
        addMethodsCategorized(this.filters['categories']);
      },

      /**
       * Save of the temperature filters, index by unique hash string.
       *
       * @param params
       *  Parameters object regularly coming from the query string.
       */
      setTemperature: function (params) {
        // Prepare temperature filter in querystring format.
        var filter = getTemperatureFilter(params);
        // Create and save hash.
        var hash = Utils.objToHash(filter);
        this.set('activeTemperatureHash', hash);

        // Clean Properties.
        filter = Utils.cleanProperties(filter);

        // Set property with the filters.
        this.filters['temperature'] = angular.isUndefined(this.filters['temperature']) ? {} : this.filters['temperature'];
        this.filters['temperature'][this.get('activeTemperatureHash')] = filter;
      }
  };

    /**
     * Return querystring of the parameter, representing the temperature filter.
     *
     * @param meter
     *  The climate meter object.
     *
     * @returns {Object}
     */
    function getTemperatureFilter(params) {
      var filter;

      // Prepare filters for data request.
      filter = {
        // @fixme: assuming there can be only one climate meter.
        'filter[meter]': params.climate,
        'filter[frequency]': params.chartFreq,
        'filter[timestamp][operator]': 'BETWEEN',
        'filter[timestamp][value][0]': params.chartPreviousPeriod || '',
        'filter[timestamp][value][1]': params.chartNextPeriod || ''
      };

      return filter;
    }

    /**
     * Return querystring of the parameter, representing the electricity filter.
     *
     * @param params
     *
     * @returns {Object}
     */
    function getElectricityFilter(params) {
      // Complete params object to request electricity.
      angular.extend(params, {
        selectorType: params.sel,
        selectorId: params.ids && params.ids.split(','),
        multipleGraphs: isMultiGraphs
      });

      return filtersFromSelector(params);
    }

    /**
     * Return a boolean value if will show multiple charts.
     *
     * @returns {boolean}
     */
    function isMultiGraphs() {
      return angular.isArray(this.selectorId);
    }

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
            filters['filter[' + params.selectorType + '][value][' + i++ +']'] = id;
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
     * Add extra method to handle the array of filter of categories.
     *
     * @param categories
     *  The filters category collection.
     */
    function addMethodsCategorized(categories) {
      categories.getCategoryFilter = getCategoryFilter;
      angular.forEach(categories, function(category) {
        if (category.children) {
          addMethodsCategorized(category.children);
        }
      });
    }

    /**
     * Return collection of categories.
     *
     * @param value
     *  The category object.
     */
    function getCategories(value) {
      return value['tree'] || value;
    }

    /**
     * Return the categories with meters associed.
     *
     * @param categories
     *  The category collection.
     * @returns {*}
     *  The categories where the property meters is different
     */
    function getCategoriesWithMeters(categories) {

      angular.forEach(categories, function(category, index) {
        // Get subcategories with meters.
        category.children = category.children && getCategoriesWithMeters(category.children);

        // Redefine the category filter object.
        categories[index] = refineToCategoryFilter(category);
      });

      return categories;
    }

    /**
     * Return an object with the necesary properties to keep the value.
     *
     * @param category
     * @returns {{id: *, label: *, children: *}}
     */
    function refineToCategoryFilter(category) {
      return {
        id: category.id,
        label: category.label,
        children: category.children,
        checked: true,
        indeterminate: false
      };
    }

    /**
     * Return Categories with the checked property udpated.
     *
     * @param value {id: boolean}
     *  Object indicate what item of categories have to update the property
     *  checked.
     * @param categories
     *  Categories
     * @returns {*}
     */
    function getCategoriesWithCategoryUpdate(value, categories) {
      if (angular.isUndefined(categories)) {
        categories = this.get('categories');
      }

      angular.forEach(categories, function(category, index) {
        if (category.id === +Object.keys(value)) {
          category.checked = value[category.id];

          if (category.children) {
            // Set the unchecked|checked also the category children.
            setCategoryChildren(category.children, value[category.id]);
          }
        }

        // Look up into the category children.
        if (category.children) {
          categories[index].children = getCategoriesWithCategoryUpdate(value, category.children);

          // Remove parent selection if is children have indeterminate state.
          if (getChildrenCheckedState(category.children) === 'indeterminate') {
            categories[index].checked = false;
          }
        }

      }, categories);

      return categories;
    }

    /**
     * Return the state of checked property of all children, true, false
     * or indeterminate.
     *
     * @param categories
     *  Collection of categories.
     *
     * @returns {*}
     *  The checked
     */
    function getChildrenCheckedState(categories) {
      var state;

      // Clone categories to avoid side effect.
      categories = angular.copy(categories);

      // Cast the meters ammount to string, need it to the $filter service.
      if (angular.isNumber(categories[0].meters)) {
        categories = categories.map(function(category) {
          category.meters = category.meters.toString();
          return category;
        });
      }
      categories = $filter('filter')(categories, {meters: "!0"}, true);

      // Determine the 'checked' state.
      angular.forEach(categories, function(category) {
        state = (state !== category.checked && angular.isDefined(state) || state === 'indeterminate') ? 'indeterminate' : category.checked;
      });

      return state;
    }

    /**
     * Set the property 'checked' true|false
     *
     * @param categories
     *  Collection of categories.
     * @param value
     *  Boolean value indicate when is checked.
     */
    function setCategoryChildren(categories, value) {
      angular.forEach(categories, function(category, index) {
        category.checked = value;

        if (category.children) {
          setCategoryChildren(category.children, value);
        }
      });
    }

    /**
     * Update property checked of the children with the value of the parent.
     *
     * @param value
     *  Value set in the cheked property of the parent. boolean
     */
    function getUpdatedCategoryChildren(category, value) {
      var children = getCategoryChildren.bind($injector.get('FilterFactory'), category.id);

      angular.forEach(children, function(category) {
        category.checked = value;
      });

      return children;
    }

    /**
     * Returns a boolen, true to indicate that subcategories have property
     * checked  in diferent states each one 'true' or 'false'. otherwise
     * return false.
     *
     * @param categoryId
     *  The category id.
     */
    function isInderminate(categoryId) {
      var children = getCategoryChildren.bind($injector.get('FilterFactory'), categoryId)();

      return (!children) ? false : categoriesWithMultiplesStates(children);
    };

    /**
     * Returns the children of a specific category.
     *
     * @param categoryId
     * @returns {Array|children|Function|*|{}}
     */
    function getCategoryChildren(categoryId, categories) {
      var children;
      categories = categories || this.get('categories');

      angular.forEach(categories, function(category) {
        if (category.id === categoryId) {
          children = category.children;
        }

        if (category.children) {
          children = children || getCategoryChildren(categoryId, category.children);
        }
      });

      return children;
    }

    /**
     * Returns a boolen, true to indicate that subcategories have property
     * checked  in diferent states each one 'true' or 'false'. otherwise
     * return false.
     *
     * @param categories
     *  The category list, could be only a subset of the category object.
     */
    function categoriesWithMultiplesStates(categories) {
      var stateChanges=0;
      var lastState;

      angular.forEach(categories, function(category) {
        if (category.checked !== lastState) {
          lastState = category.checked;
          stateChanges++;
        }
      });

      return (stateChanges !== 1 && categories.length > 1) ? true : false;
    }

    /**
     * Return from category filters a category with the id indicated.
     * otherwise, undefined.
     *
     * @param id
     *  The category id
     * @returns {*}
     *  The category filter information.
     */
    function getCategoryFilter(id) {
      var categoryFilter;

      angular.forEach(this, function(category) {
        if (category.id === id) {
          categoryFilter = category;
        }

        if (category.children && angular.isUndefined(categoryFilter)) {
          categoryFilter = category.children.getCategoryFilter(id)
        }

      });

      return categoryFilter;
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

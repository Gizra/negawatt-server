'use strict';

angular.module('negawattClientApp')
  .factory('MeterFilter', function ($filter, $stateParams, $rootScope, Utils) {
    /**
     * Set the states of the filter checkoxes control.
     *
     * @param value
     * @returns {*}
     */
    function setCategorized(name, value) {
      // Get categories object.
      value = getCategories(value);

      // Clear categories without meters.
      value = getCategoriesWithMeters(value);

      console.log(name, value);
      this.filters[name] = value;
    }

    /**
     * Return collection of categories.
     *
     * @param value
     *  Thae category object.
     */
    function getCategories(value) {
      return value['tree'] || value;
    }

    /**
     * Return the categories with meters asocied.
     *
     * @param categories
     *  The category collection.
     * @returns {*}
     *  The categories where the property meters is different
     */
    function getCategoriesWithMeters(categories) {
      categories = $filter('filter')(categories, {meters: "!0"});

      // Get subcategories with meters.
      angular.forEach(categories, function(category) {
        category.children = category.children && getCategoriesWithMeters(category.children);
      });

      return categories;
    }

    return {
      filters: {},
      byCategory: function(meters) {
        meters = Utils.toArray(meters.listAll);

        return Utils.indexById($filter('filter')(meters, function filterByCategory(meter) {
          // Return meters.
          if (!this.filters.category || meter.meter_categories && meter.meter_categories[this.filters.category]) {
            return meter;
          }
        }.bind(this), true));
      },
      clear: function() {
        this.clearMeterSelection();
        $stateParams.chartNextPeriod = undefined;
        $stateParams.chartPreviousPeriod = undefined;

        this.filters = {};
      },
      getMeterSelected: function() {
        return this.filters.meterSelected || undefined;
      },
      setMeterSelected: function(meter) {
        this.filters.meterSelected = meter;
      },
      clearMeterSelection: function() {
        if (angular.isDefined(this.filters.meterSelected)) {
          this.filters.meterSelected.unselect();
        }

        //Clear filters.
        this.filters.meterSelected = undefined;
        this.filters.meter = undefined;
      },
      set: function(name, value) {
        // Extra task if is the filter categorized
        if (name === 'categorized') {
          setCategorized.bind(this, name, value)();
          return;
        }

        this.filters[name] = value;
      },
      get: function(name) {
        return this.filters && this.filters[name];
      }

    };
  });

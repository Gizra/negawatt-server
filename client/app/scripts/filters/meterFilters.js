angular.module('negawattClientApp')

  .filter('filterMeterByCategories', function (Utils, $filter) {

    /**
     * Return an array of the category ids, of not checeked.
     *
     * @returns {Array}
     */
    function getCategoriesUnchecked(categories) {
      var filter = [];

      // Filter the collection object.
      angular.forEach(categories, function(categoryChecked, index) {
        if (!categoryChecked) {
          this.push(index);
        }
      }, filter);

      return filter;
    }


    /**
     * From a collection of meters filter meter with categories in the list of categories ids.
     *
     * @param meters
     *  The meters collection to filter.
     * @param categories
     *  An array categories ids.
     *
     * @returns {*}
     *  The meters collection filtered.
     */
    return function (meters, selection, categories){
      var filtered;
      var metersFiltered = {};
      var metersCollection;

      // Get unselected checkboxes from categories menu (list).
      unchecked = getCategoriesUnchecked(selection);
      if (unchecked.length) {
        // Assert the filter recive a meters array.
        if (angular.isObject(meters)) {
          metersCollection = Utils.toArray(meters);
        }

        // Filter meter colection.
        angular.forEach(unchecked, function(category) {
          filtered = filterMetersUnchecked(metersCollection, category);
          metersCollection = (Object.keys(filtered).length) ? metersFiltered = filtered : metersFiltered = {};
        });

        // Update output value
        meters = metersFiltered;
      }

      /**
       * Function to filter meters not categorized with an category.
       *
       * @param meters
       *  The meters filtered
       * @param category
       *  The category to search in the meter_categories property
       * @returns {*}
       */
      function filterMetersUnchecked(meters, category) {
        if (angular.isObject(meters)) {
          meters = Utils.toArray(meters);
        }

        return Utils.indexById($filter('filter')(meters, function(meter){
          return !meter.meter_categories[category] && meter;
        }));
      }


      return meters;
    }
  });

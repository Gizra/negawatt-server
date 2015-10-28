angular.module('negawattClientApp')

  .filter('filterMeterByCategories', function (Utils, FilterFactory, $filter) {

    /**
     * From a collection of meters filter meter with categories in the list of categories ids.
     *
     * @param meters
     *  The meters collection to filter.
     * @param categories
     *  An array categories ids.
     * @param hasFilter
     *  The categories filter 'categorized' is defined.
     *
     * @returns {*}
     *  The meters collection filtered.
     */
    return function (meters, categories, hasFilter){
      var filtered = [];
      var reverseFilter = [];

      if (!categories.length && hasFilter) {
        meters = filtered;
      }

      if (meters.length && categories.length) {
        // Assert the filter recive a meters array.
        if (!angular.isArray(meters)) {
          meters = Utils.toArray(meters);
        }

        // Validate that the categories id's are strings.
        if (angular.isNumber(categories[0])) {
          categories = categories.map(function(id) {
            return id.toString()
          });
        }

        // Realize the filter.
        angular.forEach(categories, function(category) {
          // Get meters with the category.
          filtered = filtered.concat($filter('filter')(meters, {meter_categories: {$: {id: category}}}, true));
        });

        meters = filtered;
      }

      // Return a collection of meters indexed by id.
      if (angular.isArray(meters)) {
        meters = Utils.indexById(meters);
      }

      return meters;
    }
  });

angular.module('negawattClientApp')

  .filter('filterMeterByCategories', function (Utils, $filter) {
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
    return function (meters, categories, reverse){
      var filter = [];
      var reverseFilter = [];
      if (categories.length && meters.length) {
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
          filter = filter.concat($filter('filter')(meters, {meter_categories: {$: {id: category}}}, true));
          if (reverse) {
            reverseFilter = reverseFilter.concat($filter('filter')(meters, {meter_categories: {$: {id: "!" + category}}}, true))
          }
        });

        meters = filter = Utils.indexById(filter);

        // Remove meter with category not included and categories includes.
        if (reverse) {
          reverseFilter = Utils.indexById(reverseFilter);
          meters = removeMixCategories(filter, reverseFilter);
        }

      }

      return meters;
    }

    /**
     * Remove the elements categorized from the collection of the elements
     * not categorized.
     *
     * @param filter
     *  Collection of the meters categorized by the categories filtered.
     * @param reverseFilter
     *  Colection of the meters not categorized with the categories, but
     *  categorized with the rest of the categories, not filtered.
     *
     */
    function removeMixCategories(filter, reverseFilter) {

      var keys = Object.keys(filter);

      angular.forEach(keys, function(id) {
        delete reverseFilter[id];
      });

      return reverseFilter;
    }
  });

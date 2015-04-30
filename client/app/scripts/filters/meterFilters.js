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
    return function (meters, categories){
      var filter = [];
      if (categories.length) {
        // Assert the filter recive a meters array.
        if (angular.isObject(meters)) {
          meters = Utils.toArray(meters);
        }

        angular.forEach(categories, function(category) {
          filter = filter.concat($filter('filter')(meters, {meter_categories: {$: {id: category}}}, true));
        });

        meters = Utils.indexById(filter);
      }

      return meters;
    }
  });

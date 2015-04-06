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
      // Assert the filter recive a meters array.
      if (angular.isObject(meters)) {
        meters = Utils.toArray(meters);
      }

      // Filter meters from the collection with the categories in the list.
      meters = $filter('filter')(meters, function(meter){
        var visible;
        visible = meter.meter_categories.map(function(meter_category) {
          if (categories.indexOf(meter_category) === -1) {
            return true;
          }
          return false;
        })

        // Return meter not filter.
        if (visible.indexOf(false) === -1) {
          return meter;
        }
      });

      meters = Utils.indexById(meters);

      return meters;
    }
  });

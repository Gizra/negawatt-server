angular.module('negawattClientApp')
  .filter('metersByActiveCategory', function (Utils, FilterFactory, $filter) {

    /**
     * From a collection of meters filter meter with categories in the list of categories ids.
     *
     * @param meters
     *  The meters collection to filter.
     * @param id
     *  Id of the meter to return.
     *
     * @returns {*}
     *  The meter object.
     */
    return function (meters){
      return filterMetersWithActiveCategory(meters);
    }

    /**
     * Filter meters by category.
     *
     * @param meters
     *  The meters collection.
     *
     * @returns {*}
     *  The meters collection filter by category.
     */
    function filterMetersWithActiveCategory(meters) {
      meters = Utils.toArray(meters.listAll);

      return Utils.indexById($filter('filter')(meters, angular.bind(FilterFactory, filterByCategory), true));
    }

    /**
     *
     * @param meter
     * @returns {*}
     */
    function filterByCategory(meter) {
      // Return meters with the active category.
      if (!this.isDefine('category') || meter.meter_categories && meter.meter_categories[this.get('category')]) {
        return meter;
      }
    }
  });


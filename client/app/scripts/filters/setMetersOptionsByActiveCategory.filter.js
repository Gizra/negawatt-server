angular.module('negawattClientApp')
  .filter('setMetersOptionsByActiveCategory', function (Utils, FilterFactory, $filter) {

    /**
     * From a collection of meters filter meter with categories in the list of categories ids.
     *
     * @param meters
     *  The meters collection to filter.
     * @param options
     *  Options to apply to the icon according active category.
     * @param condition
     *  Specific condition to apply the options.
     *
     * @returns {*}
     *  The meter object.
     */
    return function (meters, options, condition){
      return filterMetersWithActiveCategory(meters, options, condition);
    }

    /**
     * Filter meters by category.
     *
     * @param meters
     *  The meters collection.
     * @param condition
     *  Specific condition to apply the options.
     * @param options
     *  Options to apply to the icon according active category.
     *
     * @returns {*}
     *  The meters collection filter by category.
     */
    function filterMetersWithActiveCategory(meters, options, condition) {
      meters = Utils.toArray(meters);

      return Utils.indexById($filter('filter')(meters, angular.bind(null, setMeterIconOptions, options, condition), true));
    }

    /**
     * Callback executed for the filter
     *
     * @param condition
     *  Specific condition to apply the options.
     * @param options
     *  Options to apply to the icon according active category.
     * @param meter
     *  The active meter
     * @returns {*}
     */
    function setMeterIconOptions(options, condition, meter) {
      var conditionFullfilled = angular.bind(meter, fullfill, condition);

      // Reset icon state.
      meter.icon.setOptions('activeCategory');
      // Return meters with the active category.
      if (!Utils.isEmpty(meter.icon) && conditionFullfilled()) {
        meter.icon.setOptions(options);
      }

      return meter;
    }

    /**
     * Validate if the object "this" fullfill the condition.
     *
     * @param condition
     *  Specific condition to apply the options.
     */
    function fullfill(condition) {
      var validate;

      switch (condition) {
        case undefined:
          validate = true;
          break;
        case 'activeCategory':
          validate = !(this.meter_categories && this.meter_categories[FilterFactory.get('category')]);
          break;
        case 'noActiveCategory':
          validate = this.meter_categories && !this.meter_categories[FilterFactory.get('category')];
          break;
      }

      return validate || false;
    }

  });


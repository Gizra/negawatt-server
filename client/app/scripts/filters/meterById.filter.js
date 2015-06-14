angular.module('negawattClientApp')

  .filter('meterById', function (Utils, FilterFactory, $filter) {

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
    return function (meters, id){
      var meter;

      meter = angular.copy(meters)[id] || [];

      return !Utils.isEmpty(meter) && meter || {};
    }
  });

angular.module('negawattClientApp')
  .filter('activeElectricityFilters', function (FilterFactory) {

    /**
     * Get from all the colecction of electricity collection's
     * (order by has electricity filter) the
     *
     * @param collection
     *  The collection dataset of electricity indexed by hash.
     *
     * @returns {*}
     *  The electricity object of the filters selected.
     */
    return function (collection){
      var active = FilterFactory.get('activeElectricityHash');
      // Recreate collection object.
      return collection[active] && collection[active].data || {};
    }

  });

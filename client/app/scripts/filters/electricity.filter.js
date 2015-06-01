angular.module('negawattClientApp')
  .filter('activeElectricityFilters', function (FilterFactory) {

    /**
     * Get electricity collection's of the active request.
     * if a property is define get the value of the specific property,
     * instead the data.
     *
     * @param collection
     *  The collection dataset of electricity indexed by hash.
     * @param property
     *  Get value of specfic property data of the electricity object, instead the data.
     *
     * @returns {*}
     *  The electricity object of the filters selected.
     */
    return function (collection, property){
      var active = FilterFactory.get('activeElectricityHash');
      // Recreate collection object.
      return collection[active] && (property) ? collection[active][property] : collection[active].data || {};
    }

  });

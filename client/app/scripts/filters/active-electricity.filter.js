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
      // Get hash of the active electricity request.
      var active = FilterFactory.get('activeElectricityHash');

      // Recreate collection object.
      return collection[active] && getValue(collection[active], property) || {};
    }

    /**
     * Return the the value of a property from the item of the collection.
     * By default return "data" property, but if "property" parameter is
     * defined, return the value of that property.
     *
     * @param electricity
     *  Active request from electricity collection.
     * @param property
     *  Property name
     * @returns {*}
     */
    function getValue(electricity, property) {
      return property && electricity[property] || electricity.data;
    }

  });

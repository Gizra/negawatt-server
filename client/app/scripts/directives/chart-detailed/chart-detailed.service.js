'use strict';

angular.module('negawattClientApp')
  .service('ChartDetailed', function ($q, FilterFactory, Electricity, Temperature) {
    var self = this;
    var isUndefined = angular.isUndefined;

    this.getElectricity = getElectricity;
    this.getCompareCollection = getCompareCollection;

    /**
     * Return a promise with electricity collection.
     *
     * @param filters
     *   Filters of the query.
     *
     * @returns {Promise}
     */
    function getElectricity(filters) {
      FilterFactory.set('electricity', filters);
      var electricity = Electricity.get(FilterFactory.get('activeElectricityHash'));

      return isUndefined(electricity) ? $q.promise : electricity;
    }

    /**
     * Return a promise of the collection to compare, according the compareWith parameter.
     *
     * @param compareWith
     *  String indicating the collection to compare (Ex. temperature|occupancy).
     * @param filters
     *   Filters of the query.
     *
     * @returns {Promise}
     */
    function getCompareCollection(compareWith, filters) {
      var promise;

      if (compareWith === 'temperature') {
        promise = getTemperature(filters);
      }

      return promise;
    }

    /**
     * Return a promise with temperature collection.
     *
     * @param filters
     *   Filters of the query.
     *
     * @returns {Promise}
     */
    function getTemperature(filters) {
      FilterFactory.set('temperature', filters);
      var temperature = Temperature.get(FilterFactory.get('activeElectricityHash'));

      return isUndefined(temperature) ? $q.promise : temperature;
    }

  });

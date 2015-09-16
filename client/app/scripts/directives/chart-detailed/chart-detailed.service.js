'use strict';

angular.module('negawattClientApp')
  .service('ChartDetailedService', function ($q, FilterFactory, Electricity, Temperature) {
    var self = this;
    var isUndefined = angular.isUndefined;

    this.getElectricity = getElectricity;
    this.getTemperature = getTemperature;
    this.getCompareCollection = getCompareCollection;

    /**
     * Return a promise with electricity collection.
     *
     * @param filters (optional)
     *   Filters of the query.
     *
     * @returns {Promise}
     */
    function getElectricity(filters) {
      //if (filters) {
      //  FilterFactory.setElectricity(filters);
      //}
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
      //FilterFactory.setTemperature(filters);
      var temperature = Temperature.get(FilterFactory.get('activeTemperatureHash'));

      return isUndefined(temperature) ? $q.promise : temperature;
    }

  });

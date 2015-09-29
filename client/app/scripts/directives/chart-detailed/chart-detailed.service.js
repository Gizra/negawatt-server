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
      if (filters) {
        FilterFactory.setElectricity(filters);
      }
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
      if (filters) {
        FilterFactory.setTemperature(filters);
      }
      var temperature = Temperature.get(FilterFactory.get('activeTemperatureHash'))
        .then(function (data) {
          return interpolateTemperature(data, filters);
        });

      return isUndefined(temperature) ? $q.promise : temperature;
    }

    /**
     * Interpoleate climate data if needed.
     *
     * Climate data might come in 3 hours intervals (IMS data). For day and weed charts, with only
     * one data line (no meters selected, or one meter selected), broken line chart is used for
     * TOUse colors, so interpolateNulls cannot be set to true. Hence, the missing data points
     * must be interpolated
     *
     * @param data
     *   The original data.
     * @param filters
     *   Filters of the query.
     *
     * @returns {array}
     *   Data with interpolated data-points in the original 'holes'.
     */
    function interpolateTemperature(data, filters) {
      // Interpolate only in day and week charts, when there's no meter selected or
      // only one meter selected.
      if (filters.chartFreq == 4 && (!filters.sel || filters.sel.split(',').length < 2)) {
        // Hours frequency
        var prevTimestamp = undefined,
          prevValue = undefined;
        var interpolatedData = [];
        angular.forEach(data, function (item) {
          var newTimestamp = item.timestamp_rounded,
            newValue = item.avg_temp;
          // Only from the second data point and on.
          if (prevTimestamp) {
            // Calculate the number of data points to interpolate in an hour (3600 secs.) interval.
            var numInterpolatedPoints = (newTimestamp - prevTimestamp) / 3600 - 1,
              dy = (newValue - prevValue) / (numInterpolatedPoints + 1);
            // Add the new points.
            for (var i = 0; i <numInterpolatedPoints; i++) {
              // Advance the time and value for the interpolation.
              prevTimestamp += 3600;
              prevValue += dy;
              // Add new data point.
              interpolatedData.push({
                timestamp: prevTimestamp,
                timestamp_rounded: prevTimestamp,
                avg_temp: prevValue
              });
            }
          }
          // Add the original data point too.
          interpolatedData.push(item);
          // Save the time and value for next iteration.
          prevTimestamp = +newTimestamp;
          prevValue = +newValue;
        });
        // Return the interpolated data.
        return interpolatedData;
      }
      // No interpolation required, return the original data.
      return data;
    }

  });

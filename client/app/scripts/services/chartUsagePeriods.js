'use strict';

angular.module('negawattClientApp')
  .service('ChartUsagePeriod', function (Period, Chart, moment, $injector) {

    // Extend Period Factory.
    var extend = angular.extend;
    extend(this, Chart);

    var copy = angular.copy;
    // Extend Period Factory.
    var period = angular.extend({}, Period);

    /**
     * Return the actual Period
     *
     * @returns {Object}
     */
    this.getPeriod = function() {
      return period;
    };

    /**
     * Calculate the next and previous periods in unix format time.
     *
     * @param type
     *  String to indicate if is next or previous.
     *
     * @returns {{next: null, previous: null}|*}
     */
    this.getNewPeriod = function(type) {
      // Define new period.
      var newPeriod = {
        next: period.next,
        previous: period.previous
      };

      // Calculate the new period od period.
      if (type === 'next') {
        newPeriod = {
          next: (moment.unix(period.next).isAfter(moment.unix(period.max), period.chart.frequency) || moment.unix(period.next).isSame(moment.unix(period.max), period.chart.frequency)) ? null : period.add(period.next).unix(),
          previous: period.add(period.previous).unix()
        };
      }
      // This calculate the previous period.
      if (type === 'previous'){
        newPeriod = {
          next: period.subtract(period.next).unix(),
          previous: (moment.unix(period.previous).isBefore(moment.unix(period.min), period.chart.frequency) || moment.unix(period.previous).isSame(moment.unix(period.min), period.chart.frequency)) ? null : period.subtract(period.previous).unix()
        };
      }

      // Extend the Period factory methods.
      newPeriod = extend(copy(period), newPeriod);
      return newPeriod;
    };

    /**
     * Set the limits (maximum and minimum) values for the period of the chart,
     * expresed in timestamp unix format.
     *
     * @param max
     *  The maximun and minimum dates.
     *  {
     *    max: timestamp,
     *    min: timestamp
     *  }
     */
    this.setLimits = function(limits) {
      period.max = limits && +limits.max;
      period.min = limits && +limits.min;
    };

    /**
     * Extend the time stamp object with the actual period selection.
     *
     * @param chart
     *  Chart default configuration.
     * @param newPeriod
     *  New values of period object.
     */
    this.setPeriod = function(newPeriod) {
      // Set frequency from selected chart configuration.
      period.setConfig(this.getActiveFrequency());

      // If newPeriod is defined update limit of the chart.
      if (angular.isDefined(newPeriod)) {
        period.setPeriod(newPeriod);
      }
    };

    /**
     * Clear the actual period and the theirs limits.
     */
    this.resetPeriods = function() {
      angular.extend(period, {max: null, min: null, next: null, previous: null});
    };

    /**
     * Return the new (next or previous) period, set as actual period.
     *
     * @param type
     *  String indicate the type of ui button (next or previous)
     *
     * @returns {Object}
     *  Return the actual period values.
     */
    this.changePeriod = function(type) {
      var actual = $injector.get('ChartUsagePeriod');
      // Ser the new period.
      actual.setPeriod(actual.getNewPeriod(type));

      return actual.getPeriod();
    }

    /**
     * Return a boolean to indicate if the ui button of the next or previous period
     * has to be show.
     *
     * @param type
     *  String indicate the type of ui button (next or previous)
     *
     * @returns boolean
     */
    this.hasPeriod = function(type) {
      var actual = $injector.get('ChartUsagePeriod');
      // Validate if next is equal o greater than the last limit.
      if (type === 'next') {
        return !actual.getNewPeriod(type).isLast();
      }

      if (type === 'previous') {
        return !actual.getNewPeriod(type).isFirst();
      }
    };

  });

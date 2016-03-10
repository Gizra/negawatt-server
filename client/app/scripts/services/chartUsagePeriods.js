'use strict';

angular.module('negawattClientApp')
  .service('ChartUsagePeriod', function (Utils, Period, Chart, moment, $injector, $stateParams, $state) {

    // Extend Period Factory.
    var extend = angular.extend;
    extend(this, Chart);

    var copy = angular.copy;
    // Extend Period Factory.
    var period = extend({}, Period);

    /**
     * Return the $stateParams
     *
     * This necesary if need the new $stateParams value and still $location
     * do not trigger url refresh.
     *
     * @type {$stateParams|*}
     */
    this.stateParams = $stateParams;

    this.reset = reset;

    /**
     * Configure the initial values of a period, according the filters and data set.
     *
     * @param limits
     */
    this.config = function(params) {
      period.setLimits(params);
      // Set frequency from selected chart configuration.
      period.setTimeFrame(this.getActiveFrequency());
      // Set initial period according the time frame.
      period.setPeriod(params);
    };

    /**
     * Return the actual Period
     *
     * @returns {Object}
     */
    this.getChartPeriod = function() {
      return period;
    };


    /**
     * Return the new (next or previous) period, set as actual period.
     *
     * @param periodDirection
     *  String indicate the periodDirection of ui button (next or previous)
     *
     * @returns {Object}
     *  Return the actual period values.
     */
    this.changePeriod = function(periodDirection) {
      if (periodDirection == 'next') {
        period.goNextPeriod();
      }
      else {
        period.goPreviousPeriod();
      }
    };

    /**
     * Called when frequency is changed.
     *
     * @param frequency
     *  Frequency object of the new frequency selected.
     */
    this.changeFrequency = function(frequency) {
      reset();
      this.setActiveFrequency(frequency);
      period.setTimeFrame(this.getActiveFrequency());

      // Unset next and previous. They will be set after electricity (with noData) is received.
      period.previous = undefined;
      period.next = undefined;
    };

    /**
     * Called when reference-date is changed.
     *
     * @param date
     *  A new reference date.
     */
    this.setReferenceDate = function(date) {
      period.setPeriod({newDate: date});
    };

    /**
     * Return reference-data.
     *
     * @return {int}
     *  Reference date.
     */
    this.getReferenceDate = function() {
      return period.referenceDate;
    };

    /**
     * Return a boolean to indicate if the ui button of the next or previous period
     * has to be show.
     *
     * @param periodDirection
     *  String indicate the periodDirection of ui button (next or previous)
     *
     * @returns boolean
     */
    this.hasPeriod = function(periodDirection) {
      // Validate if next is equal o greater than the last limit.
      if (periodDirection === 'next') {
        return !getNewPeriod(periodDirection).isLast();
      }

      if (periodDirection === 'previous') {
        return !getNewPeriod(periodDirection).isFirst();
      }
    };

    /**
     * Calculate the next and previous periods in unix format time.
     *
     * @param periodDirection
     *  String to indicate if is next or previous.
     *
     * @returns {{next: null, previous: null}|*}
     */
    function getNewPeriod(periodDirection) {
      // Define new period.
      var newPeriod = {};

      // Calculate the new period od period.
      if (periodDirection === 'next' && period.next !== null) {
        newPeriod = {
          next: (moment.unix(period.next).isAfter(moment.unix(period.max)) || moment.unix(period.next).isSame(moment.unix(period.max))) ? null : period.add(period.next).unix(),
          previous: period.add(period.previous).unix()
        };
      }
      // This calculate the previous period.
      if (periodDirection === 'previous' && period.previous !== null){
        newPeriod = {
          next: period.subtract(period.next).unix(),
          previous: (moment.unix(period.previous).isBefore(moment.unix(period.min)) || moment.unix(period.previous).isSame(moment.unix(period.min))) ? null : period.subtract(period.previous).unix()
        };
      }

      // Extend the Period factory methods.
      newPeriod = extend(copy(period), newPeriod);
      return newPeriod;
    }

    /**
     * Clear the actual period and the theirs limits.
     */
    function reset() {
      angular.extend(period, {max: null, min: null, next: null, previous: null, chart: null});
    }


  });

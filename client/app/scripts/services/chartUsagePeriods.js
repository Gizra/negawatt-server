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
    this.config = function(limits) {
      period.setLimits(limits)
      // Set frequency from selected chart configuration.
      period.setTimeFrame(this.getActiveFrequency());
      // Set initial period according the time frame.
      period.setPeriod();

      updateStateParams();
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
      // Set the new period.
      period.setPeriod(getNewPeriod(periodDirection));

      updateStateParams();
    }

    /**
     *
     */
    this.changeFrequency = function(frequency) {
      reset();
      this.setActiveFrequency(frequency);
      period.setTimeFrame(this.getActiveFrequency());

      updateStateParams();
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
     * Update $stateParams with the ChartUsagePeriod configuration.
     */
    function updateStateParams() {
      var params = {
        chartFreq: +period.activeTimeFrame.type,
        chartNextPeriod: period.next || undefined,
        chartPreviousPeriod: period.previous || undefined
      };

      // Update $stateParams factory, with new params.
      extend($stateParams, params);

      // Refresh $state with new params.
      $state.refreshUrlWith($stateParams);
    }

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
          next: (moment.unix(period.next).isAfter(moment.unix(period.max), period.activeTimeFrame.frequency) || moment.unix(period.next).isSame(moment.unix(period.max), period.activeTimeFrame.frequency)) ? null : period.add(period.next).unix(),
          previous: period.add(period.previous).unix()
        };
      }
      // This calculate the previous period.
      if (periodDirection === 'previous' && period.previous !== null){
        newPeriod = {
          next: period.subtract(period.next).unix(),
          previous: (moment.unix(period.previous).isBefore(moment.unix(period.min), period.activeTimeFrame.frequency) || moment.unix(period.previous).isSame(moment.unix(period.min), period.activeTimeFrame.frequency)) ? null : period.subtract(period.previous).unix()
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

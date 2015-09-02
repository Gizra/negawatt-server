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
      if (periodDirection == 'next') {
        period.goNextPeriod();
      }
      else {
        period.goPreviousPeriod();
      }

      updateStateParams();
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

      updateStateParams();
    };

    /**
     * Called when reference-date is changed.
     *
     * @param date
     *  A new reference date.
     */
    this.setReferenceDate = function(date) {
      period.setPeriod({newDate: date});

      updateStateParams();
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
     * Clear the actual period and the theirs limits.
     */
    function reset() {
      angular.extend(period, {max: null, min: null, next: null, previous: null, chart: null});
    }


  });

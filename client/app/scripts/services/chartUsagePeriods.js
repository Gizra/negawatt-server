'use strict';

angular.module('negawattClientApp')
  .factory('UsagePeriod', function (moment) {
    var extend = angular.extend;

    var period;

    // Period factory.
    period = {
      max: null,
      min: null,
      next: null,
      previous: null,
      frequency: 0,
      config: null,
      /**
       *
       * @param chart
       */
      setConfig: function(chart) {
        // Save chart configuration.
        this.frequency = chart && +chart.type;
        this.config = chart;

        // Set the next tiemstamp by default in 'now' of maximum limit.
        this.next = (moment().isAfter(moment.unix(this.max))) ? this.max : moment().unix();
        this.previous = period.getPrevious();
      },
      setPeriod: function(newPeriod) {
        // Check the chart limits, with the information obtained from the server. (example meters).
        if (angular.isDefined(newPeriod.max) && angular.isDefined(newPeriod.min)) {
          period.next = (moment.unix(period.next).isAfter(moment.unix(newPeriod.max))) ? period.next : newPeriod.max;
          period.previous = (moment.unix(period.previous).isAfter(moment.unix(newPeriod.min))) ? period.previous : newPeriod.min;
        }

        // Set according current newPeriod.
        if (angular.isDefined(newPeriod.next) && angular.isDefined(newPeriod.previous)) {
          // Comming from the calculation.
          period.next = newPeriod.next;
          period.previous = newPeriod.previous;
        }
      },
      getPrevious: function() {
        return moment.unix(this.next).subtract(this.config && this.config.chart_default_time_frame, this.config && this.config.frequency).unix();
      },
      isLast: function() {
        return ( moment.unix(this.next).isAfter(moment.unix(this.max), this.config && this.config.frequency) || moment.unix(this.next).isSame(moment.unix(this.max), this.config && this.config.frequency) )
      },
      isFirst: function() {
        return ( moment.unix(this.previous).isBefore(moment.unix(this.min), this.config && this.config.frequency) || moment.unix(this.previous).isSame(moment.unix(this.min), this.config && this.config.frequency) );
      },
      add: function(time) {
        return moment.unix(time).add(this.config && this.config.chart_default_time_frame, this.config && this.config.frequency);
      },
      subtract: function(time) {
        return moment.unix(time).subtract(this.config && this.config.chart_default_time_frame, this.config && this.config.frequency);
      }
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
    function setLimits(limits) {
      period.max = limits && +limits.max;
      period.min = limits && +limits.min;
    }

    /**
     * Extend the time stamp object with the actual period selection.
     *
     * @param chart
     *  Chart default configuration.
     * @param newPeriod
     *  New values of period object.
     */
    function setPeriod(chart, newPeriod) {
      // Set frequency from selected chart configuration.
      period.setConfig(chart);

      // If newPeriod is defined update limit of the chart.
      if (angular.isDefined(newPeriod)) {
        period.setPeriod(newPeriod);
      }
    }

    /**
     * Calculate the next and previous periods in unix format time.
     *
     * @param type
     *  String to indicate if is next or previous.
     *
     * @returns {{next: null, previous: null}|*}
     */
    function calculateNextsPeriods(type) {
      var periods;


      // By default we keep that same
      periods = {
        next: period.next,
        previous: period.previous
      }

      // Calculate the new period od period.
      if (type === 'next' && !period.isLast()) {
        var nextTime = period.add(period.next).unix();
        periods = {
          next: (moment.unix(nextTime).isAfter(moment.unix(period.max), period.config.frequency)) ? null : nextTime,
          previous: period.add(period.previous).unix()
        }
      }
      // This calculate the previous period.
      else {
        periods = {
          next: period.subtract(period.next).unix(),
          previous: period.subtract(period.previous).unix()
        }
      }
      return periods;
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
    function showControl(type) {
      // Validate if next is equal o greater than the last limit.
      if (type === 'next') {
        return !period.isLast();
      }

      if (type === 'previous') {
        return !period.isFirst();
      }
    }

    return {
      // Set the limit maximum and minumum of the period to show.
      setLimits: setLimits,
      // Get initial period configuration.
      setPeriod: setPeriod,
      // Return boolean to indicate if show or no the next/previous period control.
      showControl: showControl,
      // Calculate the next and previous version.
      newPeriod: calculateNextsPeriods,
      getPeriod: function() {
        return period;
      }
    };
  });

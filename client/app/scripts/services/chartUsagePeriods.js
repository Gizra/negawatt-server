'use strict';

angular.module('negawattClientApp')
  .factory('UsagePeriod', function (moment) {
    var extend = angular.extend;

    var timestamp;

    // Period factory.
    timestamp = {
      max: null,
      min: null,
      next: null,
      previous: null,
      frequency: 0,
      config: null,
      setConfig: function(chart) {
        // Save chart configuration.
        this.frequency = +chart.type;
        this.config = chart;

        // Set the next tiemstamp by default in 'now' of maximum limit.
        this.next = (moment().isAfter(moment.unix(this.max))) ? this.max : moment().unix();
        this.previous = timestamp.getPrevious();
      },
      setPeriod: function(period) {
        // Check the chart limits, with the information obtained from the server. (example meters).
        if (angular.isDefined(period.max) && angular.isDefined(period.min)) {
          timestamp.next = (moment.unix(timestamp.next).isAfter(moment.unix(period.max))) ? timestamp.next : period.max;
          timestamp.previous = (moment.unix(timestamp.previous).isAfter(moment.unix(period.min))) ? timestamp.previous : period.min;
        }

        // Set according current period.
        if (angular.isDefined(period.next) && angular.isDefined(period.previous)) {
          // Comming from the calculation.
          timestamp.next = period.next;
          timestamp.previous = period.previous;
        }
      },
      getPrevious: function() {
        return moment.unix(this.next).subtract(this.config.chart_default_time_frame, this.config.frequency).unix();
      },
      isLast: function() {
        return ( moment.unix(this.next).isAfter(moment.unix(this.max), this.config.frequency) || moment.unix(this.next).isSame(moment.unix(this.max), this.config.frequency) )
      },
      isFirst: function() {
        return ( moment.unix(this.previous).isBefore(moment.unix(this.min), this.config.frequency) || moment.unix(this.previous).isSame(moment.unix(this.min), this.config.frequency) );
      },
      add: function(time) {
        return moment.unix(time).add(this.config.chart_default_time_frame, this.config.frequency);
      },
      subtract: function(time) {
        return moment.unix(time).subtract(this.config.chart_default_time_frame, this.config.frequency);
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
      timestamp.max = +limits.max;
      timestamp.min = +limits.min;
    }

    /**
     * Extend the time stamp object with the actual peiod selection.
     *
     * @param chart
     *  Chart default configuration.
     * @param period
     *  New values of period object.
     */
    function setPeriod(chart, period) {
      // Set frequency from selected chart configuration.
      timestamp.setConfig(chart);

      // If period is defined update limit of the chart.
      if (angular.isDefined(period)) {
        timestamp.setPeriod(period);
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
        next: timestamp.next,
        previous: timestamp.previous
      }

      // Calculate the new period od timestamp.
      if (type === 'next' && !timestamp.isLast()) {
        var nextTime = timestamp.add(timestamp.next).unix();
        periods = {
          next: (moment.unix(nextTime).isAfter(moment.unix(timestamp.max), timestamp.config.frequency)) ? null : nextTime,
          previous: timestamp.add(timestamp.previous).unix()
        }
      }
      // This calculate the previous period.
      else {
        periods = {
          next: timestamp.subtract(timestamp.next).unix(),
          previous: timestamp.subtract(timestamp.previous).unix()
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
      // Validate if next is equal o greater than the last limit timestamp.
      if (type === 'next') {
        return !timestamp.isLast();
      }

      if (type === 'previous') {
        return !timestamp.isFirst();
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
      period: calculateNextsPeriods,
      getPeriod: function() {
        return timestamp;
      }
    };
  });

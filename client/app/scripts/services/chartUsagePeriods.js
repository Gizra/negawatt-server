'use strict';

angular.module('negawattClientApp')
  .factory('UsagePeriod', function (Period, moment) {
    var extend = angular.extend;
    var period = {};

    return {
      // Set the default configuration of the period based on the type of Chart
      // and set his limits.
      config: config,
      // Change the new limits of the chart, according the state and the filters.
      setLimits: setLimits,
      // Return boolean to indicate if show or no the next/previous period control.
      showControl: showControl,
      // Calculate the next and previous version.
      newPeriod: calculateNextsPeriods,
      getPeriod: function() {
        return period;
      }
    };

    /**
     * Configure the period acording the chart object.
     *
     * @param limits
     *
     * @param chart
     *
     */
    function config(limits, chart) {
      // Extend period with default data at first config.
      !Object.keys(period).length && angular.extend(period, Period);
      setLimits(limits);
      setPeriod(chart);
    }

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

  });

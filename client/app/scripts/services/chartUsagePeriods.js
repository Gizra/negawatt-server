'use strict';

angular.module('negawattClientApp')
  .factory('UsagePeriod', function (moment) {
    var extend = angular.extend;

    var timestamp,
      params;

    // Calculation Params.
    params = {
      last: {}
    };

    // Period.
    timestamp = {
      max: null,
      min: null,
      next: null,
      previous: null
    };

    /**
     *
     *
     * @param max
     * @param min
     */
    function setLimits(max, min) {
      timestamp.max = max;
      timestamp.min = min;
    }

    /**
     *
     * @param frequency
     * @param period
     */
    function setConfig(frequency, period) {
      // Set chart limit period from default
      timestamp.next = (frequency.chart_default_time_frame_end === 'now') ? moment().unix() : frequency.chart_default_time_frame_end;
      timestamp.previous = moment.unix(timestamp.next).subtract(frequency.chart_default_time_frame, frequency.frequency).unix();

      // If period is defined update limit of the chart.
      if (angular.isDefined(period)) {
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
      }

      // Set the last timestamp.
      params = {
        last: (frequency.chart_default_time_frame_end === 'now') ? timestamp.last = moment().unix() : frequency.chart_default_time_frame_end,
        add: function(time) {
          return moment.unix(time).add(frequency.chart_default_time_frame, frequency.frequency);
        },
        subtract: function(time) {
          return moment.unix(time).subtract(frequency.chart_default_time_frame, frequency.frequency);
        },
        frequency: frequency.frequency
      }
    }

    /**
     * Set initial params and limits.
     *
     * @param frequency
     *  String with the frequency to add od substract to the actual timestamp. (second, minute, day, month or year)
     */
    function getConfig(frequency, filters) {
      // Set the last timestamp.
      params = {
        last: (frequency.chart_default_time_frame_end === 'now') ? timestamp.last = moment().unix() : frequency.chart_default_time_frame_end,
        add: function(time) {
          return moment.unix(time).add(frequency.chart_default_time_frame, frequency.frequency);
        },
        subtract: function(time) {
          return moment.unix(time).subtract(frequency.chart_default_time_frame, frequency.frequency);
        },
        frequency: frequency.frequency
      }

      // Extend period object with new values.
      extend(timestamp, {
        previous: filters['filter[timestamp][value][0]'],
        next: filters['filter[timestamp][value][1]']
      });
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


      var isLastPeriod;
      var periods;


      // Validate if next is equal o greater than the last limit timestamp.
      if (moment.unix(timestamp.next).isAfter(moment.unix(params.last), params.frequency) || moment.unix(timestamp.next).isSame(moment.unix(params.last), params.frequency) ) {
        isLastPeriod = true;
      }

      // By default we keep that same
      periods = {
        next: timestamp.next,
        previous: timestamp.previous
      }

      // Calculate the new
      if (type === 'next' && !isLastPeriod) {
        var nextTime = params.add(timestamp.next).unix();
        periods = {
          next: (moment.unix(nextTime).isAfter(moment.unix(params.last), params.frequency)) ? null : nextTime,
          previous: params.add(timestamp.previous).unix()
        }
      }
      else {
        periods = {
          next: params.subtract(timestamp.next).unix(),
          previous: params.subtract(timestamp.previous).unix()
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
    function hideControl(type) {
      var isLastPeriod;
      // Validate if next is equal o greater than the last limit timestamp.
      if (type === 'next' && (moment.unix(timestamp.next).isAfter(moment.unix(params.last), params.frequency) || moment.unix(timestamp.next).isSame(moment.unix(params.last), params.frequency)) ) {
        isLastPeriod = true;
      }

      return isLastPeriod;
    }

    return {
      // Set the limit maximum and minumum of the period to show.
      setLimits: setLimits,
      // Get initial period configuration.
      config: setConfig,
      // Return boolean to indicate if hide or no the next/previous period control.
      hideControl: hideControl,
      // Calculate the next and previous version.
      period: calculateNextsPeriods,
      getPeriod: function() {
        return timestamp;
      }
    };
  });

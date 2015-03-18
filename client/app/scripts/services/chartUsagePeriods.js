'use strict';

angular.module('negawattClientApp')
  .factory('UsagePeriod', function (moment) {
    var extend = angular.extend;

    var times,
      params;

    // Calculation Params.
    params = {
      last: {}
    };

    // Period.
    times = {
      next: null,
      previous: null
    };

    /**
     * Set initial params and limits.
     *
     * @param frequency
     *  String with the frequency to add od substract to the actual timestamp. (second, minute, day, month or year)
     */
    function setParams(frequency, filters) {
      // Set the last timestamp.
      params = {
        last: (frequency.chart_default_time_frame_end === 'now') ? times.last = moment().unix() : frequency.chart_default_time_frame_end,
        add: function(time) {
          return moment.unix(time).add(frequency.chart_default_time_frame, frequency.frequency);
        },
        subtract: function(time) {
          return moment.unix(time).subtract(frequency.chart_default_time_frame, frequency.frequency);
        },
        frequency: frequency.frequency
      }

      // Extend period object with new values.
      extend(times, {
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
      if (moment.unix(times.next).isAfter(moment.unix(params.last), params.frequency) || moment.unix(times.next).isSame(moment.unix(params.last), params.frequency) ) {
        isLastPeriod = true;
      }

      // By default we keep that same
      periods = {
        next: times.next,
        previous: times.previous
      }

      // Calculate the new
      if (type === 'next' && !isLastPeriod) {
        var nextTime = params.add(times.next).unix();
        periods = {
          next: (moment.unix(nextTime).isAfter(moment.unix(params.last), params.frequency)) ? null : nextTime,
          previous: params.add(times.previous).unix()
        }
      }
      else {
        periods = {
          next: params.subtract(times.next).unix(),
          previous: params.subtract(times.previous).unix()
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
      // Validate if next is equal o greater than the last lismit timestamp.
      if (type === 'next' && (moment.unix(times.next).isAfter(moment.unix(params.last), params.frequency) || moment.unix(times.next).isSame(moment.unix(params.last), params.frequency)) ) {
        isLastPeriod = true;
      }

      return isLastPeriod;
    }

    return {
      // Get acctual configuration.
      setFrequency: setParams,
      // Return boolean to indicate if hide or no the next/previous period control.
      hideControl: hideControl,
      // Calculate the next and previous version.
      period: calculateNextsPeriods
    };
  });

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
     * @param frequency
     */
    function setParams(frequency, filters) {
      // Set the last timestamp.
      params = {
        last: (frequency.chart_default_time_frame_end === 'now') ? times.last = moment().unix() : frequency.chart_default_time_frame_end,
        add: function(time) {
          console.log(frequency.chart_default_time_frame, frequency.frequency, moment.unix(time).add(frequency.chart_default_time_frame, frequency.frequency));
          return moment.unix(time).add(frequency.chart_default_time_frame, frequency.frequency);
        },
        subtract: function(time) {
          return moment.unix(time).subtract(frequency.chart_default_time_frame, frequency.frequency);
        }
      }

      // Entendemos.
      extend(times, {
        previous: filters['filter[timestamp][value][0]'],
        next: filters['filter[timestamp][value][1]']
      });

      console.log(frequency);
      console.log(params, times);
      console.log(filters);
    }

    function calculateNextsPeriods(type) {
      var isLastPeriod;
      var periods;

      // Validate if next is equal o greater than the last lismit timestamp.
      if (moment.unix(times.next).isAfter(moment.unix(params.last)) || moment.unix(times.next).isSame(moment.unix(params.last)) ) {
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
          next: (moment.unix(nextTime).isAfter(moment.unix(params.last))) ? null : nextTime,
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

    function hideControl(type) {
      var isLastPeriod;
      // Validate if next is equal o greater than the last lismit timestamp.
      if (type === 'next' && (moment.unix(times.next).isAfter(moment.unix(params.last)) || moment.unix(times.next).isSame(moment.unix(params.last))) ) {
        isLastPeriod = true;
      }

      return isLastPeriod;
    }

    return {
      // Get acctual configuration.
      setFrequency: setParams,
      hideControl: hideControl,
      // Calculate the next and previous version.
      period: calculateNextsPeriods
    };
  });

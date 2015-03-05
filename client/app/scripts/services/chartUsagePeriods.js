'use strict';

angular.module('negawattClientApp')
  .factory('UsagePeriod', function (moment) {
    var times;

    // Timestamp.
    times = {
      last: {},
      next: null,
      previous: null
    };

    /**
     * Set initial params and limits.
     * @param frecuency
     */
    function setParams(frecuency, filters) {
      console.log(frecuency);
      console.log(times);
      console.log(filters);
      // Set the last timestamp.
      times.last = (frecuency.chart_default_time_frame_end === 'now') ? times.last = moment().unix() : frecuency.chart_default_time_frame_end;
      times = {
        previous: filters['filter[timestamp][value][0]'],
        next: filters['filter[timestamp][value][1]']
      }
    }

    function calculateNextsPeriods(type) {
      console.log(type);
      var periods;
      debugger;
      // Calculate the new

      if (type === 'next') {

      }
      return true;
    }

    function updateControls() {
      return true;
    }

    return {
      // Get acctual configuration.
      setFrequency: setParams,
      controls: {
        next: true,
        previous: true
      },
      period: calculateNextsPeriods
    };
  });

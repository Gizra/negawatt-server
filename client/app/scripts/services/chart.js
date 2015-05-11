'use strict';

angular.module('negawattClientApp')
  .factory('Chart', function chartFactory() {
    // The private on
    var chart = {
      frequencies: setFrequencies()
    };

    // Common object for the charts.
    return {
      /**
       * Common messages
       */
      messages: {
        empty: 'אין מספיק נתונים כדי להציג את התרשים.'
      },
      /**
       * Return object of the frequencies
       * @returns {*}
       */
      getFrequencies: function() {
        return chart.frequencies;
      },
      /**
       * Set the frequency active.
       *
       * @param chartFreq - {number}
       *  Tyep of the frequency object.
       */
      setActiveFrequency: function(chartFreq) {
        resetFrequencies();
         // Chart frequency test.
        chart.frequencies[chartFreq].active = true;
      }
    };

    /**
     * Get frecuencies object.
     *
     * @returns {*}
     *  Return the types of frequencies to show electricity data.
     */
    function setFrequencies() {
      return {
        1: {
          frequency: 'year',
          label: 'שנה',
          type: '1',
          unit_num_seconds: 365 * 24 * 60 * 60,
          chart_default_time_frame: 10,
          chart_type: 'ColumnChart',
          axis_v_title: 'קוט"ש בחודש',
          axis_h_format: 'YYYY',
          axis_h_title: 'שנה'
        },
        2: {
          frequency: 'month',
          label: 'חודש',
          type: '2',
          unit_num_seconds: 31 * 24 * 60 * 60,
          chart_default_time_frame: 24,
          chart_type: 'ColumnChart',
          axis_v_title: 'קוט"ש בשנה',
          axis_h_format: 'MM-YYYY',
          axis_h_title: 'חודש'
        },
        3: {
          frequency: 'day',
          label: 'יום',
          type: '3',
          unit_num_seconds: 24 * 60 * 60,
          chart_default_time_frame: 14,
          chart_type: 'ColumnChart',
          axis_v_title: 'קוט"ש ביום',
          axis_h_format: 'DD-MM',
          axis_h_title: 'תאריך'
        },
        4: {
          frequency: 'hour',
          label: 'שעה',
          type: '4',
          unit_num_seconds: 60 * 60,
          // One week.
          chart_default_time_frame: 168,
          chart_type: 'LineChart',
          axis_v_title: 'KW',
          axis_h_format: 'HH',
          axis_h_title: 'שעה'
        },
        5: {
          frequency: 'minute',
          label: 'דקות',
          type: '5',
          unit_num_seconds: 60,
          // 48 hours.
          chart_default_time_frame: 1440,
          chart_type: 'LineChart',
          axis_v_title: 'KW',
          axis_h_format: 'HH',
          axis_h_title: 'שעה'
        }
      };
    }

    /**
     * Set all the frequencies false.
     */
    function resetFrequencies() {
      angular.forEach(chart.frequencies, function(frequency) {
        frequency.active = false;
      });
    }

  });

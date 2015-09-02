'use strict';

angular.module('negawattClientApp')
  .factory('Chart', function chartFactory($filter, Utils) {
    var isDefined = angular.isDefined;
    // The private chart object, configuration.
    var chart = {
      frequencies: setFrequencies(),
      multipleGraphs: false
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
       * Return a collection of frequencies or a specific frequency.
       *
       * @param type {Number}
       *  The type of the frecuency.
       * @returns {*}
       *  The frecuency object or collection .
       */
      getFrequencies: function(type) {
        return isDefined(type) ? get('frequencies')[type] : get('frequencies');
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
        chart.frequencies[chartFreq].active = 'active';
      },
      /**
       * Return the frequency object active.
       *
       * @param chartFreq - {number}
       *  Tyep of the frequency object.
       */
      getActiveFrequency: function() {
        // Chart frequency test.
        return ($filter('filter')(Utils.toArray(chart.frequencies), isActive, true))[0];
      },

      /**
       * Format a date range according to the selected frequency.
       *
       * @param from
       *   Range start timestamp.
       * @param until
       *   Range end timestamp.
       *
       * @return
       *   Formatted date range.
       */
      formatDateRange: function(from, until) {
        // Select the range date formatting according to the current frequency.
        switch (this.getActiveFrequency().frequency) {
          case 'years':
          case 'year':
            var format = 'YYYY';
            break;
          case 'month':
            var format = 'MM/YYYY';
            break;
          case 'week':
          case 'day':
            var format = 'DD/MM/YYYY';
            break;
        }

        switch (this.getActiveFrequency().frequency) {
          case 'year':
          case 'week':
          case 'day':
          case 'hour':
            return moment(from).format(format) + '-' + moment(until).format(format);

          case 'month':
            return moment(from).format(format);
        }
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
          frequency: 'years',
          label: 'שנים',
          type: '1',
          unit_num_seconds: 365 * 24 * 60 * 60,
          chart_default_time_frame: 10,
          axis_v_title: 'קוט"ש בשנה',
          axis_h_format: 'YYYY',
          axis_h_title: 'שנה',
          get_period: function(timestamp) {
            // Return a period, from the beginning of 9 years ago, to the end of this year
            // (total 10 years).
            var year = moment.unix(timestamp).year();
            return { from: moment({y: year - 9}).unix(), to: moment({y: year + 1}).unix() }
          }
        },
        2: {
          frequency: 'year',
          label: 'שנה',
          type: '2',
          unit_num_seconds: 31 * 24 * 60 * 60,
          chart_default_time_frame: 24,
          axis_v_title: 'קוט"ש בחודש',
          axis_h_format: 'MM/YYYY',
          axis_h_title: 'חודש',
          get_period: function(timestamp) {
            // Return a period, from the beginning of the previous year to year's end
            // (total 2 years).
            var year = moment.unix(timestamp).year();
            return { from: moment({y: year - 1}).unix(), to: moment({y: year + 1}).unix() }
          }
        },
        3: {
          frequency: 'month',
          label: 'חודש',
          type: '3',
          unit_num_seconds: 24 * 60 * 60,
          chart_default_time_frame: 31,
          axis_v_title: 'קוט"ש ביום',
          axis_h_format: 'DD/MM',
          axis_h_title: 'תאריך',
          get_period: function(timestamp) {
            // Return a period, from the beginning of the month to its end.
            var year = moment.unix(timestamp).year(),
              month = moment.unix(timestamp).month();
            return { from: moment({y: year, M: month}).unix(), to: moment({y: year, M: month + 1}).unix() }
          }
        },
        4: {
          frequency: 'week',
          label: 'שבוע',
          type: '4',
          unit_num_seconds: 60 * 60,
          // One week.
          chart_default_time_frame: 168,
          axis_v_title: 'KW',
          axis_h_format: 'HH:mm',
          axis_h_title: 'שעה',
          get_period: function(timestamp) {
            // Return a period, from the beginning of the week (Sunday) to its end.
            var year = moment.unix(timestamp).year(),
              month = moment.unix(timestamp).month(),
              day = moment.unix(timestamp).date(),
              dayOfWeek = moment.unix(timestamp).day(); // 0 - Sunday
            return { from: moment({y: year, M: month, d: day - dayOfWeek}).unix(), to: moment({y: year, M: month, d: day - dayOfWeek + 7}).unix() }
          }
        },
        5: {
          frequency: 'day',
          label: 'יום',
          type: '5',
          unit_num_seconds: 60,
          // 48 hours.
          chart_default_time_frame: 1440,
          axis_v_title: 'KW',
          axis_h_format: 'HH:mm',
          axis_h_title: 'שעה',
          get_period: function(timestamp) {
            // Return a period, from the beginning of the day to its end.
            var year = moment.unix(timestamp).year(),
              month = moment.unix(timestamp).month(),
              day = moment.unix(timestamp).date();
            return { from: moment({y: year, M: month, d: day}).unix(), to: moment({y: year, M: month, d: day + 1}).unix() }
          }
        }
      };
    }

    /**
     * Set all the frequencies false.
     */
    function resetFrequencies() {
      angular.forEach(chart.frequencies, function(frequency) {
        frequency.active = '';
      });
    }

    /**
     * Set the new value for a specific property.
     *
     * @param name
     *  The name of the property.
     * @param value
     *  The value of the property.
     */
    function set(name, value) {
      chart[name] = value;
    }


    /**
     * Return a config parameter of the Chart object.
     *
     * @param name
     *  Name of the property to get.
     *
     * @returns {*}
     *  Value of the property.
     */
    function get(name) {
      return chart[name] || undefined;
    }

    /**
     * Returns the item of the collection if have a property `active: true`
     *
     * @param item
     *  Item from the collection.
     * @returns {*}
     *  Return items active.
     */
    function isActive(item) {
      return item.active && item;
    }

  });

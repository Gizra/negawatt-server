'use strict';

angular.module('negawattClientApp')
  .factory('Period', function (moment) {

    return {
      max: null,
      min: null,
      next: null,
      previous: null,
      chart: null,
      /**
       * Set the default configuration of the period based on the type of Chart
       * and set his limits.
       *
       * @param chart
       */
      setConfig: function(chart) {
        // Save chart configuration.
        this.chart = chart;

        // Set the next timestamp by default in 'now' of maximum limit.
        this.next = (this.max && moment().isAfter(moment.unix(this.max))) ? this.max : moment().unix();
        this.previous = this.getPrevious();

      },
      // Check the chart limits, with the information obtained from the server. (example meters).
      setPeriod: function(newPeriod) {

        // Set default if is oout of range.
        if (this.isOutOfRange(newPeriod)) {
          // Set the next timestamp by default in 'now' of maximum limit.
          this.next = this.max || moment().unix();
        }

        // Set according current newPeriod.
        if (newPeriod.next && newPeriod.previous && !this.isOutOfRange(newPeriod) ) {
          // Comming from the calculation.
          this.next = newPeriod.next;
        }
        this.previous = this.getPrevious();
      },
      getPrevious: function() {
        return moment.unix(this.next).subtract(this.chart && this.chart.chart_default_time_frame, this.chart && this.chart.frequency).unix();
      },
      isLast: function() {
        return !this.next;
      },
      isFirst: function() {
        return !this.previous;
      },
      /**
       * check if the newPeriod is out of the range according the minimun and maximum defined.
       *
       * @param newPeriod
       *  Period object {previous: number, next: number}
       *
       * @returns {boolean}
       *  Boolean value true if the period is out of range, otherwise false.
       */
      isOutOfRange: function(newPeriod) {
        var outOfRange = false;

        // In both are null is outOfRange.
        if (!newPeriod.next && !newPeriod.previous) {
          outOfRange = true;
        }

        if (newPeriod.next && newPeriod.next > this.max || newPeriod.previous && newPeriod.previous > this.max ) {
          outOfRange = true;
        }

        if (newPeriod.next && newPeriod.next < this.min || newPeriod.previous && newPeriod.previous < this.min ) {
          outOfRange = true;
        }

        return outOfRange;
      },
      add: function(time) {
        return moment.unix(time).add(this.chart && this.chart.chart_default_time_frame, this.chart && this.chart.frequency);
      },
      subtract: function(time) {
        return moment.unix(time).subtract(this.chart && this.chart.chart_default_time_frame, this.chart && this.chart.frequency);
      }
    }
  });

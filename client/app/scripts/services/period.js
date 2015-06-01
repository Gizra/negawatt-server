'use strict';

angular.module('negawattClientApp')
  .factory('Period', function (moment) {

    return {
      max: null,
      min: null,
      next: null,
      previous: null,
      frequency: 0,
      chart: null,
      /**
       * Set the default configuration of the period based on the type of Chart
       * and set his limits.
       *
       * @param chart
       */
      setConfig: function(chart) {
        // Save chart configuration.
        this.frequency = chart && +chart.type;
        this.chart = chart;

        // Set the next timestamp by default in 'now' of maximum limit.
        this.next = (moment().isAfter(moment.unix(this.max))) ? this.max : moment().unix();
        this.previous = this.getPrevious();

      },
      setPeriod: function(newPeriod) {
        // Check the chart limits, with the information obtained from the server. (example meters).
        if (angular.isDefined(newPeriod.max) && angular.isDefined(newPeriod.min) && !this.isOutOfRange(newPeriod) ) {
          this.next = (moment.unix(this.next).isAfter(moment.unix(newPeriod.max))) ? this.next : newPeriod.max;
          this.previous = (moment.unix(this.previous).isAfter(moment.unix(newPeriod.min))) ? this.previous : newPeriod.min;
        }

        // Set default if is oout of range.
        if (this.isOutOfRange(newPeriod)) {
          // Set the next timestamp by default in 'now' of maximum limit.
          this.next = this.max;
          this.previous = this.getPrevious();
        }

        // Set according current newPeriod.
        if (newPeriod.next && newPeriod.previous && !this.isOutOfRange(newPeriod) ) {
          // Comming from the calculation.
          this.next = newPeriod.next;
          this.previous = newPeriod.previous;
        }
      },
      getPrevious: function() {
        return moment.unix(this.next).subtract(this.chart && this.chart.chart_default_time_frame, this.chart && this.chart.frequency).unix();
      },
      isLast: function() {
        //return ( moment.unix(this.next).isAfter(moment.unix(this.max), this.chart && this.chart.frequency) || moment.unix(this.next).isSame(moment.unix(this.max), this.chart && this.chart.frequency) )
        return !this.next;
      },
      isFirst: function() {
        //return ( moment.unix(this.previous).isBefore(moment.unix(this.min), this.chart && this.chart.frequency) || moment.unix(this.previous).isSame(moment.unix(this.min), this.chart && this.chart.frequency) );
        return !this.previous;
      },
      /**
       * check if the newPeriod is out of the reage according the minimun and maximum defined.
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

        if (newPeriod.next && newPeriod.next < this.min || newPeriod.previous && newPeriod.previous < this.mim ) {
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

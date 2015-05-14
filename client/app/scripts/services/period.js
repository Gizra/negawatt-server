'use strict';

angular.module('negawattClientApp')
  .factory('Period', function (moment) {

    return {
      max: null,
      min: null,
      next: null,
      previous: null,
      frequency: 0,
      config: null,
      /**
       * Set the default configuration of the period based on the type of Chart
       * and set his limits.
       *
       * @param chart
       */
      setConfig: function(chart) {
        // Save chart configuration.
        this.frequency = chart && +chart.type;
        this.config = chart;

        // Set the next tiemstamp by default in 'now' of maximum limit.
        this.next = (moment().isAfter(moment.unix(this.max))) ? this.max : moment().unix();
        this.previous = period.getPrevious();
      },
      setPeriod: function(newPeriod) {
        // Check the chart limits, with the information obtained from the server. (example meters).
        if (angular.isDefined(newPeriod.max) && angular.isDefined(newPeriod.min)) {
          period.next = (moment.unix(period.next).isAfter(moment.unix(newPeriod.max))) ? period.next : newPeriod.max;
          period.previous = (moment.unix(period.previous).isAfter(moment.unix(newPeriod.min))) ? period.previous : newPeriod.min;
        }

        // Set according current newPeriod.
        if (angular.isDefined(newPeriod.next) && angular.isDefined(newPeriod.previous)) {
          // Comming from the calculation.
          period.next = newPeriod.next;
          period.previous = newPeriod.previous;
        }
      },
      getPrevious: function() {
        return moment.unix(this.next).subtract(this.config && this.config.chart_default_time_frame, this.config && this.config.frequency).unix();
      },
      isLast: function() {
        return ( moment.unix(this.next).isAfter(moment.unix(this.max), this.config && this.config.frequency) || moment.unix(this.next).isSame(moment.unix(this.max), this.config && this.config.frequency) )
      },
      isFirst: function() {
        return ( moment.unix(this.previous).isBefore(moment.unix(this.min), this.config && this.config.frequency) || moment.unix(this.previous).isSame(moment.unix(this.min), this.config && this.config.frequency) );
      },
      add: function(time) {
        return moment.unix(time).add(this.config && this.config.chart_default_time_frame, this.config && this.config.frequency);
      },
      subtract: function(time) {
        return moment.unix(time).subtract(this.config && this.config.chart_default_time_frame, this.config && this.config.frequency);
      }
    }
  });

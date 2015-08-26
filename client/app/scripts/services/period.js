'use strict';

angular.module('negawattClientApp')
  .factory('Period', function ($injector, moment, Utils) {

    return {
      max: null,
      min: null,
      next: null,
      previous: null,
      activeTimeFrame: null,
      referenceDate: moment().unix(),

      /**
       * Return true if the limits are configured, otherwise return false.
       *
       * @returns {boolean}
       */
      isConfigured: function() {
        return !!this.max && !!this.min;
      },
      /**
       * Set the default configuration of the period based on the type of Chart
       * and set his limits.
       *
       * @param activeTimeFrame
       */
      setTimeFrame: function(activeTimeFrame) {
        // Save activeTimeFrame configuration.
        this.activeTimeFrame = activeTimeFrame;
      },
      /**
       * Set the limits (maximum and minimum) values for the period of the activeTimeFrame,
       * expresed in timestamp unix format.
       *
       * @param max
       *  The maximun and minimum dates.
       *  {
       *    max: timestamp,
       *    min: timestamp
       *  }
       */
      setLimits: function(limits) {
        this.max = limits && +limits.max || null;
        this.min = limits && +limits.min || null;
      },
      /**
       * Set next/previos values from the actual period object information.
       *
       * @param newPeriod
       *  New values of period object.
       */
      setPeriod: function(newPeriod) {
        // Set initial values.
        if (angular.isUndefined(newPeriod) && Utils.isEmpty(this.next)){
          this.next = this.max;
        }
        else {
          // Set default if is out of range.
          if (this.isOutOfRange(newPeriod)) {
            // Set the next timestamp by default in 'now' of maximum limit.
            this.next = this.max || moment().unix();
          }

          // Set according current newPeriod.
          if (newPeriod.next && newPeriod.previous && !this.isOutOfRange(newPeriod) ) {
            // Comming from the calculation.
            this.next = newPeriod.next;
          }
        }

        // Only make calculation when next timestamp is defiend.
        this.previous = (this.next === null) ? null : this.getPrevious();
      },
      getPrevious: function() {
        return moment.unix(this.next).subtract(this.activeTimeFrame && this.activeTimeFrame.chart_default_time_frame, this.activeTimeFrame && this.activeTimeFrame.frequency).unix();
      },
      isLast: function() {
        return !this.next;
      },
      isFirst: function() {
        return !this.previous;
      },
      /**
       * check if a period is out of the range according the minimun and maximum defined.
       *
       * @param period
       *  Period object {previous: number, next: number}
       *
       * @returns {boolean}
       *  Boolean value true if the period is out of range, otherwise false.
       */
      isOutOfRange: function(period) {
        var outOfRange = false;

        // Apply to the current period.
        if (angular.isUndefined(period)) {
          period = {
            next: this.next,
            previous: this.previous
          }
        }

        // In both are null is Out of Range.
        if (!period.next && !period.previous) {
          outOfRange = true;
        }

        if (period.previous && period.previous > this.max) {
          outOfRange = true;
        }

        if (period.next && period.next < this.min) {
          outOfRange = true;
        }

        return outOfRange;
      },
      add: function(time) {
        return moment.unix(time).add(this.activeTimeFrame && this.activeTimeFrame.chart_default_time_frame, this.activeTimeFrame && this.activeTimeFrame.frequency);
      },
      subtract: function(time) {
        return moment.unix(time).subtract(this.activeTimeFrame && this.activeTimeFrame.chart_default_time_frame, this.activeTimeFrame && this.activeTimeFrame.frequency);
      }
    }
  });

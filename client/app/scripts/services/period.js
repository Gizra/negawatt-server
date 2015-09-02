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
       * Return the referenceDate.
       *
       * @returns {int}
       */
      getReferenceDate: function() {
        return this.referenceDate;
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
      setPeriod: function(param) {
        // If new-date is given, calc the time-frame around it.
        if (param && param.newDate) {
          this.referenceDate = param.newDate;
        }

        // Make sure we're in the allowed time frame.
        if (this.isOutOfRange(this.referenceDate)) {
          this.referenceDate = this.putInRange(this.referenceDate);
        }

        // Set to a time-period around the referenceDate.
        var fromTo = this.activeTimeFrame.get_period(this.referenceDate);
        this.previous = fromTo.from;
        this.next = fromTo.to;
      },

      isLast: function() {
        return this.isOutOfRange(this.next);
      },

      isFirst: function() {
        return this.isOutOfRange(this.previous-1);
      },

      goNextPeriod: function() {
        // If frequency object provides a next-timestamp function, us it. Otherwise, take a period around this.next.
        this.referenceDate = this.activeTimeFrame.getNextTimestamp ? this.activeTimeFrame.getNextTimestamp() : this.next;
        this.setPeriod();
      },

      goPreviousPeriod: function() {
        // If frequency object provides a prev-timestamp function, us it. Otherwise, take a period around this.prev.
        this.referenceDate = this.activeTimeFrame.getPreviousTimestamp ? this.activeTimeFrame.getPreviousTimestamp() : this.previous - 1;
        this.setPeriod();
      },

      /**
       * Check if timestamp is out of the range according the minimun and maximum defined.
       *
       * @param {int} timestamp
       *  Timestamp to check.
       *
       * @returns {boolean}
       *  Boolean value true if the timestamp is not defined or out of range, otherwise false.
       */
      isOutOfRange: function(timestamp) {
        return !timestamp
          || this.max && timestamp > this.max
          || this.min && timestamp < this.min;
      },

      /**
       * Return a value that is closest to timestamp, but within the allowed range.
       *
       * @param {int} timestamp
       *  Timestamp to check.
       *
       * @returns {int}
       *  Timestamp within allowed range.
       */
      putInRange: function(timestamp) {
        if (this.max && timestamp > this.max) {
          return this.max;
        }
        if (this.min && timestamp < this.min) {
          return this.min;
        }
        return timestamp;
      },

      add: function(time) {
        return moment.unix(time).add(this.activeTimeFrame && this.activeTimeFrame.chart_default_time_frame, this.activeTimeFrame && this.activeTimeFrame.frequency);
      },

      subtract: function(time) {
        return moment.unix(time).subtract(this.activeTimeFrame && this.activeTimeFrame.chart_default_time_frame, this.activeTimeFrame && this.activeTimeFrame.frequency);
      }
    }
  });

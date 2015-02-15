'use strict';

/**
 * @ngdoc service
 * @name negawattClientApp.timedate
 * @description
 * # timedate
 * Factory in the negawattClientApp.
 */
angular.module('negawattClientApp')
  .factory('Timedate', function ($interval) {
    // Define object.
    var timedate = {
      today: new Date(),
      // value initialize in null keep hide the clock until get the first value.
      now: null,
      /**
       * Update the now property every second with the actual date.
       */
      startClock: function() {
        var self = this;
        $interval(function() {
          self.now = new Date();
        }, 1000);
      }
    };

    // Start the clock.
    timedate.startClock();

    return timedate;
  });

'use strict';

angular.module('negawattClientApp')
  .factory('Chart', function chartFactory() {

    // Common object for the charts.
    return {
      /**
       * Common messages
       */
      messages: {
        empty: 'אין מספיק נתונים כדי להציג את התרשים.'
      }
    };
  });

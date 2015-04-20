'use strict';

angular.module('negawattClientApp')
  .factory('MeterFilter', function ($filter, $stateParams, Utils) {

    return {
      filters: {},
      byCategory: function(meters) {
        meters = Utils.toArray(meters.listAll);

        return Utils.indexById($filter('filter')(meters, function filterByCategory(meter) {
          // Return meters.
          if (!this.filters.category || meter.meter_categories && meter.meter_categories[this.filters.category]) {
            return meter;
          }
        }.bind(this), true));
      },
      clear: function() {
        $stateParams.chartNextPeriod = undefined;
        $stateParams.chartPreviousPeriod = undefined;

        this.filters = {};
      }
    };

  });

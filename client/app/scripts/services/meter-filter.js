'use strict';

angular.module('negawattClientApp')
  .factory('MeterFilter', function ($filter, $stateParams, $rootScope, Utils) {
    function test(value) {
      return value;
    }


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
        this.clearMeterSelection();
        $stateParams.chartNextPeriod = undefined;
        $stateParams.chartPreviousPeriod = undefined;

        this.filters = {};
      },
      getMeterSelected: function() {
        return this.filters.meterSelected || undefined;
      },
      setMeterSelected: function(meter) {
        this.filters.meterSelected = meter;
      },
      clearMeterSelection: function() {
        if (angular.isDefined(this.filters.meterSelected)) {
          this.filters.meterSelected.unselect();
        }

        //Clear filters.
        this.filters.meterSelected = undefined;
        this.filters.meter = undefined;
      },
      set: function(name, value) {
        this.filters[name] = value;
        if (name === 'categorized') {
          test(value);
        }
      },
      get: function(name) {
        return this.filters && this.filters[name];
      }

    };
  });
